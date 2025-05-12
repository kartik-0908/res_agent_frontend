import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('makai-chat-model');
  const deepResearchFromCookie = cookieStore.get('makai-deep-research');
  console.log('deep research from cookie:', deepResearchFromCookie);
  const deepResearch = false 
  || (deepResearchFromCookie !== undefined && deepResearchFromCookie.value === 'true' ? true : false);

  if (!modelIdFromCookie) {
    console.log('No chat model found in cookies, using default model');
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
          initialDeepResearch={deepResearch}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie.value}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
        initialDeepResearch={deepResearch}
      />
      <DataStreamHandler id={id} />
    </>
  );
}