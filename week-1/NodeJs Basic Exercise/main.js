async function main() {
  try {
    // Requirement 1 & 2
    const [users, posts, comments] = await Promise.all([
      fetch('https://jsonplaceholder.typicode.com/users').then((res) =>
        res.json(),
      ),
      fetch('https://jsonplaceholder.typicode.com/posts').then((res) =>
        res.json(),
      ),
      fetch('https://jsonplaceholder.typicode.com/comments').then((res) =>
        res.json(),
      ),
    ]);

    // Requirement 3
    users.forEach((user) => {
      // Lọc và bỏ userId khỏi posts
      user.posts = posts
        .filter((post) => post.userId === user.id)
        .map(({ userId, ...rest }) => rest); // Loại bỏ userId

      const postIds = user.posts.map((post) => post.id);

      // Lọc comment theo postId
      user.comments = comments
        .filter((comment) => postIds.includes(comment.postId))
        .map(({ id, postId, name, body }) => ({
          id,
          postId,
          name,
          body,
        }));
    });

    // Tạo biến mới đã rút gọn từ users
    const simplifiedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      comments: user.comments,
      posts: user.posts,
    }));

    // console.dir(simplifiedUsers, { depth: null });

    // Requirements 4
    const usersMoreThan3Comments = simplifiedUsers.filter(
      (user) => user.comments.length > 3,
    );
    // console.dir(usersMoreThan3Comments, { depth: null });

    // Requirements 5
    const countCommentsAndPostswithUser = usersMoreThan3Comments.map(
      (user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        commentsCount: user.comments.length,
        postsCount: user.posts.length,
      }),
    );
    // console.dir(countCommentsAndPostswithUser, { depth: null });

    // Requirements 6
    // Find user with most comments
    const userWithMostComments = countCommentsAndPostswithUser.reduce(
      (maxUser, user) => {
        return user.commentsCount > maxUser.commentsCount ? user : maxUser;
      },
    );

    // Find user with most posts
    const userWithMostPosts = countCommentsAndPostswithUser.reduce(
      (maxUser, user) => {
        return user.postsCount > maxUser.postsCount ? user : maxUser;
      },
    );

    console.log('User with the most comments:');
    console.dir(userWithMostComments, { depth: null });

    console.log('User with the most posts:');
    console.dir(userWithMostPosts, { depth: null });

    // Requirements 7
    const usersSortedByPosts = [...countCommentsAndPostswithUser].sort(
      (a, b) => b.postsCount - a.postsCount,
    );
    console.dir(usersSortedByPosts, { depth: null });

    // Requirements 8
    try {
      const postId = 1;
      const [post, comments] = await Promise.all([
        fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`).then(
          (res) => res.json(),
        ),
        fetch(
          `https://jsonplaceholder.typicode.com/posts/${postId}/comments`,
        ).then((res) => res.json()),
      ]);

      const mergedData = {
        ...post,
        comments,
      };

      console.log(`MergedData: `, mergedData);
    } catch (error) {
      console.error('Requirement 8 failed:', error);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

main();
