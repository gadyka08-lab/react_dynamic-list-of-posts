import classNames from 'classnames';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import { PostsList } from './components/PostsList';
import { PostDetails } from './components/PostDetails';
import { UserSelector } from './components/UserSelector';
import { Loader } from './components/Loader';
import { useEffect, useState } from 'react';
import { client } from './utils/fetchClient';
import { Post } from './types/Post';
import { User } from './types/User';
import { ErrorMessage } from './types/error';

export const App = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  // Стан для зберігання списку всіх користувачів, завантажених з API
  const [users, setUsers] = useState<User[]>([]);

  // Стан для зберігання обраного користувача (або null, якщо ніхто не вибраний)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Ефект для первинного завантаження юзерів
  useEffect(() => {
    client
      .get<User[]>('/users')
      .then(setUsers)
      .catch(() => {
        // У разі помилки завантаження показуємо відповідне повідомлення
        setErrorMessage(ErrorMessage.POSTS_LOAD_ERROR);
      });
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    client
      .get<Post[]>(`/posts?userId=${selectedUser.id}`)
      .then(response => {
        // записуємо отримані пости у стан
        setPosts(response);
      })
      .catch(() => {
        // якщо помилка---- повідомлення
        setErrorMessage(ErrorMessage.POSTS_LOAD_ERROR);
      })
      .finally(() => {
        // вимикаємо лоадер незалежно від результату запиту
        setIsLoading(false);
      });
  }, [selectedUser]); // дивимося за зміною вибраного юзера

  // функцію обробника
  const handleSelectUser = (user: User) => {
    setPosts([]);
    setSelectedUser(user);
    setIsLoading(true);
    setSelectedPost(null);
  };

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                <UserSelector
                  users={users}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  handleSelectUser={handleSelectUser}
                />
              </div>

              <div className="block" data-cy="MainContent">
                {selectedUser === null ? (
                  <p data-cy="NoSelectedUser">No user selected</p>
                ) : isLoading ? (
                  <Loader />
                ) : posts.length === 0 && !errorMessage ? (
                  <div className="notification is-warning" data-cy="NoPostsYet">
                    {ErrorMessage.NO_POSTS}
                  </div>
                ) : (
                  <PostsList
                    posts={posts}
                    selectedPost={selectedPost}
                    setSelectedPost={setSelectedPost}
                  />
                )}
              </div>

              {errorMessage && (
                <div
                  className="notification is-danger"
                  data-cy="PostsLoadingError"
                >
                  {ErrorMessage.POSTS_LOAD_ERROR}
                </div>
              )}
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              {
                'Sidebar--open': selectedPost !== null, // + клас за наявності вибраного поста
              },
            )}
          >
            <div className="tile is-child box is-success ">
              <PostDetails
                selectedPost={selectedPost}
                setErrorMessage={setErrorMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
