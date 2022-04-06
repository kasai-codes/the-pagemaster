const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
     if (context.user) {
       const userData = await User.findOne({_id: context.user._id}).select('-_v-password');
       
       return userData
     }
     throw new AuthenticationError('Not logged in')
    }
  },

  Mutation: {
    addUser: async (parent, {username, email, password}) => {
      const user = await User.create({username, email, password});
      const token = signToken(user);
      return {token, user};
    },

    login: async (parent, {email, password}) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect email!");
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) throw new AuthenticationError("Incorrect Password!");

      const token = signToken(user);
      return {token, user};
    },

    saveBook: async (parent, { bookId }, context) =>{
      if(context.user) {
        const newUser = await User.findByIdAndUpdate(
          {_id: context.user._id},
          {$push: {savedBooks: bookData}},
          {new: true}
        )
        return newUser;

      }
      throw new AuthenticationError("You must be logged in!");
    },
    removeBook: async (parent, { bookId }, context) => {
      if(context.user) {
          const newUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId } } },
              { new: true }
          );

          return newUser;
      }
      throw new AuthenticationError("You need to be logged in!");
  }
}










  },
};

module.exports = resolvers;
