import { env } from '$env/dynamic/private';
export async function ensureCollectionExists(pb) {
	// const pb = new PocketBase('http://localhost:8090');
	try {
		await pb.admins.authWithPassword(env.POCKETBASE_ADMIN_EMAIL, env.POCKETBASE_ADMIN_PASSWORD);
	} catch (error) {
		console.error(`Unable to login to db: ${error.message}`, {});
	}

	try {
		const collections = await pb.collections.getList(1, 50, { filter: `name='scribo'` });
		if (collections.items.length === 0) {
			await pb.collections.create({
				name: 'scribo',
				type: 'base',
				schema: [
					{
						name: 'audio',
						type: 'file',
						options: {
							maxSelect: 1,
							maxSize: 10737418240
						}
					},
					{
						name: 'transcript',
						type: 'json',
						options: {
							maxSize: 10737418240
						}
					},
					{ name: 'title', type: 'text' },
					{ name: 'rttm', type: 'text' },
					{ name: 'summary', type: 'text' },
					{ name: 'processed', type: 'bool' },
					{ name: 'diarized', type: 'bool' },
					{ name: 'model', type: 'text' },
					{ name: 'peaks', type: 'json', options: { maxSize: 10737418240 } },
					{ name: 'date', type: 'date', required: true },
					{
						name: 'diarizedtranscript', type: 'json',
						options: {
							maxSize: 10737418240
						}
					}
				]
			});
			console.log('Collection "scribo" created successfully.');
		}
	} catch (error) {
		console.error(`Failed to check or create collection: ${error.message}`, {});
	}

	try {
		const collections = await pb.collections.getList();
		const settingsCollection = collections.items.find((col) => col.name === 'settings');
		if (!settingsCollection) {
			await pb.collections.create({
				name: 'settings',
				schema: [
					{ name: 'model', type: 'text', required: true },
					{ name: 'openai', type: 'text' },
					{ name: 'default_openai_model', type: 'text' },
					{ name: 'default_template', type: 'text' },
					{ name: 'threads', type: 'number', required: true },
					{ name: 'processors', type: 'number', required: true },
					{ name: 'diarize', type: 'bool' },
					{ name: 'wizard', type: 'bool' }
				]
			});

			await pb.collection('settings').create({
				model: 'tiny',
				openai: '',
				default_openai_model: 'gpt-4o',
				default_template: '',
				threads: 2,
				processors: 1,
				diarize: false,
				wizard: false
			});

			console.log('Settings collection created.');
		}
	} catch (error) {
		console.error('Error ensuring collection exists:', error);
	}

	try {
		const collections = await pb.collections.getList();
		const templateCollection = collections.items.find((col) => col.name === 'templates');
		if (!templateCollection) {
			await pb.collections.create({
				name: 'templates',
				schema: [
					{ name: 'title', type: 'text' },
					{ name: 'prompt', type: 'text' }
				]
			});

			console.log('Template collection created.');

			await pb.collection('templates').create({
				title: 'Default template',
				prompt: 'Provide a concise and comprehensive summary for the transcript.'
			});
		}
	} catch (error) {
		console.error('Error ensuring collection exists:', error);
	}
}
