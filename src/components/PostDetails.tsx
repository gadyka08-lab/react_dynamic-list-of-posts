import React, { useEffect, useState } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import { Post } from '../types/Post';
import { client } from '../utils/fetchClient';
import { ErrorMessage } from '../types/error';
import { Comment, CommentData } from '../types/Comment';

interface Props {
  selectedPost: Post | null;
  // onSubmit: (newComment: CommentData) => void;
  setErrorMessage: (message: string) => void;
}

export const PostDetails: React.FC<Props> = ({
  selectedPost,
  setErrorMessage,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // стан збереження ID коментарів, які видаляються
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deletingCommentIds, setDeletingCommentIds] = useState<number[]>([]);

  useEffect(() => {
    // якщо пост ще не вибрано (null), ми нічого не робимо
    if (!selectedPost) {
      return;
    }

    // Скидаємо стан форми коментарів при зміні поста
    setShowCommentForm(false);

    // вкл лоадер, про всяквипадок скидаємо стару помилку, якщо вона була
    setLoading(true);
    setError(false);

    // робимо запит за маршрутом для коментів вибраного поста
    client
      .get<Comment[]>(`/comments?postId=${selectedPost.id}`)
      .then(response => {
        // Перевіряємо, чи відповідь є масивом
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

  const handleCommentSubmit = (newCommentData: CommentData): Promise<void> => {
    // перевіряємо чи вибраний якийсь пост, щоб туди + коментар
    if (!selectedPost) {
      return Promise.reject(new Error('No selected post'));
    }

    setIsSubmitting(true); // вкл завантаження перед запитом

    return client
      .post<Comment>(`/posts/${selectedPost.id}/comments`, newCommentData)
      .then(createdComment => {
        // Додаємо новий коментар до списку вже існуючих коментарів у стані
        setComments(prevComments => [...prevComments, createdComment]);
      })
      .catch(() => {
        // Обробляємо можливу помилку відправки
        setErrorMessage(ErrorMessage.POSTS_LOAD_ERROR);
      })
      .finally(() => {
        setIsSubmitting(false); // викл завантаження після завершення запиту
      });
  };

  const handleCommentDelete = (commentId: number) => {
    // вид. коментар одразу
    setComments(prevComments =>
      prevComments.filter(comment => comment.id !== commentId),
    );

    // і лише зараз робимозапит на видалення з сервера
    client.delete(`/comments/${commentId}`).catch(() => {
      setErrorMessage(ErrorMessage.POSTS_LOAD_ERROR);
    });
  };

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
                        onClick={() => handleCommentDelete(comment.id)}
                        disabled={deletingCommentIds.includes(comment.id)}
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

              {!showCommentForm && (
                <button
                  data-cy="WriteCommentButton"
                  type="button"
                  className="button is-link"
                  onClick={() => setShowCommentForm(true)}
                >
                  Write a comment
                </button>
              )}
            </>
          )}
        </div>

        {!error && showCommentForm && (
          <NewCommentForm
            onSubmit={handleCommentSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </>
  );
};
