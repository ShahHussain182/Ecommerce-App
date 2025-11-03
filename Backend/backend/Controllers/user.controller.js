import { User } from '../Models/user.model.js';
import { Order } from '../Models/Order.model.js';     // Import Order model
import { Cart } from '../Models/Cart.model.js';       // Import Cart model
import { Wishlist } from '../Models/Wishlist.model.js'; // Import Wishlist model
import { Review } from '../Models/Review.model.js';     // Import Review model
import catchErrors from '../Utils/catchErrors.js';
import { updateUserSchema } from '../Schemas/authSchema.js';
import mongoose from 'mongoose';

// ... (other controller functions: getAllUsers, getUserById, updateUserProfileByAdmin) ...

/**
 * @description Delete a user (Admin only).
 */
export const deleteUserByAdmin = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findByIdAndDelete(id, { session });

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Delete associated data within the transaction
    // Using Promise.all for concurrent deletion, but awaited within the transaction
    await Promise.all([
      Order.deleteMany({ userId: id }, { session }),
      Cart.deleteMany({ userId: id }, { session }),
      Wishlist.deleteMany({ userId: id }, { session }),
      Review.deleteMany({ userId: id }, { session }),
      // If you have other user-related models (e.g., SearchHistory), add their deletions here:
      // SearchHistory.deleteMany({ userId: id }, { session }),
    ]);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Customer and all associated data deleted successfully.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting user and associated data:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the user and associated data.' });
  }
});