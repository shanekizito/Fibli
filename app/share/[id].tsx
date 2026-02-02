import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addInvitedStory, checkStoryExists, getStoryById } from '@/services/supabase';
import { getUserId } from '@/services/getUserId';
import { useLanguage } from '@/context/LanguageContext';

export default function InviteScreen() {
	const [user_id, setUserId] = useState<string | null>(null);
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { t } = useLanguage();

	useEffect(() => {
		getUserId(setUserId);
	}, []);

	useEffect(() => {
		if (!user_id) {
			return;
		}

		const handleInvite = async () => {
			try {
				const storyGist = await getStoryById(id!);

				const storyExists = await checkStoryExists({ title: storyGist.title, user_id: user_id! });
				if (storyExists) {
					router.replace('/library?error=alreadyExists');
					return;
				}

				await addInvitedStory({ gist_id: storyGist.id, user_id: user_id! });
				router.replace('/library?success=storyAdded');

			} catch (error) {
				console.error('Error handling invite:', error);
				router.replace('/library?error=storyNotFound');
			}
		};

		handleInvite();
	}, [id, user_id]);

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" />
		</View>
	);
}