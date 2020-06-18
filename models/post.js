module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      charset: "utf8mb4", // enable emoji
      collate: "utf8mb4_general_ci",
    }
  );

  Post.associate = (db) => {
    db.User.belongsTo(db.User);
    db.User.hasMany(db.Comment);
    db.User.hasMany(db.Image);
  };

  return Post;
};
