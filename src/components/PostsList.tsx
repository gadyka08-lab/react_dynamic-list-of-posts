import React from 'react';
import { Post } from '../types/Post';

// 1. Описуємо інтерфейс для пропсів компонента
interface Props {
  posts: Post[];
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
}

export const PostsList: React.FC<Props> = ({
  posts,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedPost,
  setSelectedPost,
}) => (
  <div data-cy="PostsList">
    <table className="table is-fullwidth is-striped is-hoverable is-narrow">
      <thead>
        <tr className="has-background-link-light">
          <th>#</th>
          <th>Title</th>
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <th> </th>
        </tr>
      </thead>

      <tbody>
        {posts.map((post: Post) => (
          <tr data-cy="Post" key={post.id}>
            <td data-cy="PostId">{post.id}</td>

            <td data-cy="PostTitle">{post.title}</td>

            <td className="has-text-right is-vcentered">
              <button
                type="button"
                data-cy="PostButton"
                className="button is-link is-light"
                onClick={() => setSelectedPost(post)}
              >
                Open
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
