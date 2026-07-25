import React, { useEffect, useState } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import { Post } from '../types/Post';
import { client } from '../utils/fetchClient';
import { ErrorMessage } from '../types/error';
import { Comment } from '../types/Comment';

interface Props {
  selectedPost: Post | null;
}

export const PostDetails: React.FC<Props> = ({ selectedPost }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    // 1️⃣ Захисна перевірка: якщо пост ще не вибрано (null), ми нічого не робимо
    if (!selectedPost) {
      return;
    }

    // вкл лоадер, про всяквипадок скидаємо стару помилку, якщо вона була
    setLoading(true);
    setError(false);

    // робимо запит за маршрутом для коментів вибраного поста
    client
      .get<Comment[]>(`/posts/${selectedPost.id}/comments`)
      .then(response => {
        // 💡 Перевіряємо, чи відповідь є масивом
        if (Array.isArray(response)) {
          setComments(response);
        }
      })
      .catch(() => {
        // якщо з сервера повернувся ерор, вкл стан error
        setError(true);
      })
      .finally(() => {
        // успіх чи ерор всеодно викл лоадер
        setLoading(false);
      });
  }, [selectedPost]); // працьовуватиме щоразу, коли змін selectedPost

  if (!selectedPost) {
    return null;
  }

  return (
    <>
      <div className="content" data-cy="PostDetails">
        <div className="block">
          <h2 data-cy="PostTitle">
            #{selectedPost.id}: {selectedPost.title}
          </h2>

          <p data-cy="PostBody">{selectedPost.body}</p>
        </div>

        <div className="block">
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="notification is-danger" data-cy="CommentsError">
              {ErrorMessage.POSTS_LOAD_ERROR}
            </div>
          ) : (
            <>
              <p className="title is-4">Comments:</p>

              {comments.length === 0 ? (
                <p className="title is-4" data-cy="NoCommentsMessage">
                  {ErrorMessage.NO_COMENTS}
                </p>
              ) : (
                comments.map(comment => (
                  <article
                    className="message is-small"
                    data-cy="Comment"
                    key={comment.id}
                  >
                    <div className="message-header">
                      <a
                        href={`mailto:${comment.email}`}
                        data-cy="CommentAuthor"
                      >
                        {comment.name}
                      </a>
                      <button
                        data-cy="CommentDelete"
                        type="button"
                        className="delete is-small"
                        aria-label="delete"
                      >
                        delete button
                      </button>
                    </div>

                    <div className="message-body" data-cy="CommentBody">
                      {comment.body}
                    </div>
                  </article>
                ))
              )}

              <button
                data-cy="WriteCommentButton"
                type="button"
                className="button is-link"
                onClick={() => setShowCommentForm(true)}
              >
                Write a comment
              </button>
            </>
          )}
        </div>

        {!error && showCommentForm && <NewCommentForm />}
      </div>
    </>
  );
};
