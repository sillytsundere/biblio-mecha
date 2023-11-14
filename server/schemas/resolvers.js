const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return await User.findOne({ _id: context.user._id }).select('-__v -password').populate('books');
            } 
            throw new AuthenticationError('You are not logged in!');
        }, 
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            console.log(username, email, password, 'stringssss');
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);
            //is isCorrectPassword part of something?

            if (!correctPw) {
                throw AuthenticationError
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    //what is the context? it has to do with the token? or auth? is it specific to graphql?
                    { $addToSet: { savedBooks: args.input }},
                    //
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: {savedBooks: args.bookId} },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },
};

module.exports = resolvers;