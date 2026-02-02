import {
  initConnection,
  endConnection,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getSubscriptions,
  getProducts,
  requestSubscription,
  requestPurchase,
  getAvailablePurchases,
  PurchaseError,
  Purchase,
  SubscriptionIOS,
  ProductIOS
} from 'react-native-iap';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Product IDs
export const SUBSCRIPTION_SKUS = {
  MONTHLY: 'com.fibli.subscription.monthlyunlimited',
} as const;

export const ONE_TIME_PURCHASES = {
  TWENTY_USES: 'com.fibli.iap.twentyusagenerations',
} as const;

export interface SubscriptionStatus {
  isSubscribed: boolean;
  expiryDate?: number;
  latestReceipt?: string;
}

export interface PurchaseState {
  freeGenerations: number;
  purchasedUses: number;
  isSubscribed: boolean;
}

const FREE_GENERATIONS_KEY = 'free_generations';
const PURCHASED_USES_KEY = 'purchased_uses';
const PURCHASED_UNLIMITED_KEY = 'purchased_unlimited';
const MAX_FREE_GENERATIONS = 1;

let purchaseUpdateSubscription: any;
let purchaseErrorSubscription: any;

const isWeb = Platform.OS === 'web';

export async function initializePurchases() {
  if (isWeb) return;

  try {
    await initConnection();

    // Restore previous purchases on app start
    const availablePurchases = await getAvailablePurchases();
    availablePurchases.forEach(async (purchase) => {
      if (purchase.productId === SUBSCRIPTION_SKUS.MONTHLY) {
        await handleSubscriptionPurchase();
      }
      if (purchase.productId === ONE_TIME_PURCHASES.TWENTY_USES) {
        await handleOneTimePurchase();
      }
      await finishTransaction({ purchase });
    });

    // Set up listeners
    purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          // Validate receipt with server (recommended)
          // await validateReceiptWithServer(receipt);

          if (purchase.productId === SUBSCRIPTION_SKUS.MONTHLY) {
            await handleSubscriptionPurchase();
          }

          if (purchase.productId === ONE_TIME_PURCHASES.TWENTY_USES) {
            await handleOneTimePurchase();
          }

          await finishTransaction({ purchase });
        } catch (error) {
          console.error('Error handling purchase:', error);
        }
      }
    });

    purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.error('Purchase error:', error);
    });

  } catch (error) {
    console.error('Error initializing purchases:', error);
  }
}

async function handleSubscriptionPurchase() {
  if (isWeb) return;
  const status = await getSubscriptionStatus();
  if (status.isSubscribed && status.expiryDate && status.expiryDate > Date.now()) {
    await SecureStore.setItemAsync(PURCHASED_UNLIMITED_KEY, 'true');
  } else {
    await SecureStore.setItemAsync(PURCHASED_UNLIMITED_KEY, 'false');
  }
}

async function handleOneTimePurchase() {
  const currentUses = await SecureStore.getItemAsync(PURCHASED_USES_KEY) || '0';
  const newUses = parseInt(currentUses) + 20;
  await SecureStore.setItemAsync(PURCHASED_USES_KEY, newUses.toString());
}

export async function endPurchaseConnection() {
  if (purchaseUpdateSubscription) {
    purchaseUpdateSubscription.remove();
  }
  if (purchaseErrorSubscription) {
    purchaseErrorSubscription.remove();
  }
  await endConnection();
}

export async function getMyProducts(): Promise<Array<SubscriptionIOS | ProductIOS>> {
  if (isWeb) {
    console.log('IAP not supported on web platform');
    return [];
  }

  try {
    const [subscriptions, products] = await Promise.all([
      getSubscriptions({ skus: [SUBSCRIPTION_SKUS.MONTHLY] }),
      getProducts({ skus: [ONE_TIME_PURCHASES.TWENTY_USES] })
    ]);

    return [...subscriptions, ...products] as Array<SubscriptionIOS | ProductIOS>;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (isWeb) return false;

  try {
    const availablePurchases = await getAvailablePurchases();

    for (const purchase of availablePurchases) {
      if (purchase.productId === SUBSCRIPTION_SKUS.MONTHLY) {
        await handleSubscriptionPurchase();
      }
      if (purchase.productId === ONE_TIME_PURCHASES.TWENTY_USES) {
        await handleOneTimePurchase();
      }
      await finishTransaction({ purchase });
    }

    // Update subscription status after processing
    const subscriptionStatus = await getSubscriptionStatus();
    await SecureStore.setItemAsync(
      PURCHASED_UNLIMITED_KEY,
      subscriptionStatus.isSubscribed ? 'true' : 'false'
    );

    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    return false;
  }
}

export async function purchaseSubscription(sku: string): Promise<boolean> {
  if (isWeb) return false;

  try {
    await requestSubscription({ sku });
    return true;
  } catch (error: any) {
    if (error?.code === 'E_ALREADY_OWNED') {
      return await restorePurchases();
    }
    console.error('Error purchasing subscription:', error);
    return false;
  }
}

export async function purchaseOneTimeProduct(sku: string): Promise<boolean> {
  if (isWeb) return false;

  try {
    await requestPurchase({ sku });
    return true;
  } catch (error: any) {
    if (error?.code === 'E_ALREADY_OWNED') {
      return await restorePurchases();
    }
    console.error('Error purchasing product:', error);
    return false;
  }
}

export async function getPurchaseState(): Promise<PurchaseState> {
  try {
    const [free, purchased, subStatus] = await Promise.all([
      SecureStore.getItemAsync(FREE_GENERATIONS_KEY),
      SecureStore.getItemAsync(PURCHASED_USES_KEY),
      getSubscriptionStatus()
    ]);

    return {
      freeGenerations: Math.max(0, MAX_FREE_GENERATIONS - parseInt(free || '0')),
      purchasedUses: parseInt(purchased || '0'),
      isSubscribed: subStatus.isSubscribed
    };
  } catch (error) {
    console.error('Error getting purchase state:', error);
    return {
      freeGenerations: 0,
      purchasedUses: 0,
      isSubscribed: false
    };
  }
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (isWeb) return { isSubscribed: false };

  try {
    const availablePurchases = await getAvailablePurchases();
    const subscriptions = availablePurchases.filter(
      p => p.productId === SUBSCRIPTION_SKUS.MONTHLY
    );

    // For iOS, we should ideally use server-side receipt validation
    // This is a fallback for client-side only
    const now = Date.now();
    let latestSubscription: Purchase | undefined;
    let latestExpiry = 0;

    for (const sub of subscriptions) {
      // iOS-specific fields (transactionDate in SECONDS since epoch)
      const purchaseTime = sub.transactionDate * 1000; // Convert to ms
      const expiryTime = purchaseTime + 30 * 24 * 3600 * 1000; // Approximate 30 days
      
      if (expiryTime > now && expiryTime > latestExpiry) {
        latestSubscription = sub;
        latestExpiry = expiryTime;
      }
    }

    return {
      isSubscribed: !!latestSubscription,
      expiryDate: latestExpiry || undefined,
      latestReceipt: latestSubscription?.transactionReceipt
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return { isSubscribed: false };
  }
}

export async function consumeGeneration() {
  try {
    const [free, purchased, unlimited] = await Promise.all([
      SecureStore.getItemAsync(FREE_GENERATIONS_KEY),
      SecureStore.getItemAsync(PURCHASED_USES_KEY),
      SecureStore.getItemAsync(PURCHASED_UNLIMITED_KEY)
    ]);

    const isUnlimited = unlimited === 'true';

    let freeCount = parseInt(free || '0');
    let purchasedCount = parseInt(purchased || '0');

    if (isUnlimited) {
      return;
    }

    if (purchasedCount > 0) {
      purchasedCount--;
      await SecureStore.setItemAsync(PURCHASED_USES_KEY, purchasedCount.toString());
    } else {
      freeCount++;
      await SecureStore.setItemAsync(FREE_GENERATIONS_KEY, freeCount.toString());
    }
  } catch (error) {
    console.error('Error consuming generation:', error);
    throw error;
  }
}
