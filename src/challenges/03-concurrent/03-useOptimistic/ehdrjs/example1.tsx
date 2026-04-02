import { useState, useOptimistic, useTransition } from "react";

interface Post {
  id: number;
  title: string;
  liked: boolean;
  likeCount: number;
}

const INITIAL_POSTS: Post[] = [
  { id: 1, title: "게시글 1", liked: false, likeCount: 12 },
  { id: 2, title: "게시글 2", liked: false, likeCount: 7 },
  { id: 3, title: "게시글 3", liked: true, likeCount: 24 },
];

async function fakeLikeServer(postId: number): Promise<void> {
  await new Promise((res) => setTimeout(res, 800));
  if (postId === 3) throw new Error("서버 오류");
}

type LikePayload = { postId: number; liked: boolean };

function applyLike(posts: Post[], { postId, liked }: LikePayload) {
  return posts.map((p) => (p.id === postId ? { ...p, liked, likeCount: p.likeCount + (liked ? 1 : -1) } : p));
}

export default function Example1() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [, startTransition] = useTransition();
  const [optimisticPosts, addOptimisticLike] = useOptimistic(posts, applyLike);

  function handleLike(post: Post) {
    const payload: LikePayload = { postId: post.id, liked: !post.liked };
    startTransition(async () => {
      addOptimisticLike(payload);
      try {
        await fakeLikeServer(post.id);
        setPosts((prev) => applyLike(prev, payload));
      } catch {
        // 자동 롤백
      }
    });
  }

  return (
    <ul>
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          {post.title}
          <button onClick={() => handleLike(post)}>
            {post.liked ? "❤️" : "🤍"} {post.likeCount}
          </button>
        </li>
      ))}
    </ul>
  );
}
