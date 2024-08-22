// const Bag = require("../models/Bag");
// const Inventory = require("../models/Inventory");
// const UserLoginDetails = require("../models/UserLoginDetails");

// const {
//   getAllBagItemsByUserId,
// } = require("../aggregations/getAllBagItemsByUserId");

// const { checkIfItemIsAvailable } = require("../utils/checkIfItemIsAvailable");

// const {
//   DEFAULT_ADD_QUANTITY,
//   SOLD_OUT_JEWELRY_ERROR_MESSAGE,
// } = require("../constants/bag");

// exports.create = async ({ userId, jewelryId, size }) => {
//   const isAvailable = await checkIfItemIsAvailable(jewelryId, size);

//   if (!isAvailable) {
//     throw new Error(SOLD_OUT_JEWELRY_ERROR_MESSAGE);
//   }

//   const bagItem = await Bag.findOne({ user: userId, jewelry: jewelryId, size });

//   if (bagItem) {
//     await Bag.findByIdAndUpdate(
//       bagItem._id,
//       { $inc: { quantity: +DEFAULT_ADD_QUANTITY } },
//       { new: true }
//     );
//   } else {
//     await Bag.create({
//       user: userId,
//       jewelry: jewelryId,
//       size,
//       quantity: DEFAULT_ADD_QUANTITY,
//     });
//   }

//   await Inventory.findOneAndUpdate(
//     { jewelry: jewelryId, size },
//     { $inc: { quantity: -DEFAULT_ADD_QUANTITY } },
//     { new: true }
//   );
// };

// exports.getAll = async (userId) => {
//   const user = await UserLoginDetails.findById(userId);

//   return getAllBagItemsByUserId(user);
// };

// exports.delete = async (bagId) => {
//   const bagItem = await Bag.findById(bagId);

//   const jewelryId = bagItem.jewelry;

//   const size = bagItem.size;

//   const bagQuantity = bagItem.quantity;

//   await bagItem.deleteOne();

//   await Inventory.findOneAndUpdate(
//     { jewelry: jewelryId, size },
//     { $inc: { quantity: +bagQuantity } },
//     { new: true }
//   );
// };

// exports.decrease = async (bagId) => {
//   const bagItem = await Bag.findById(bagId);

//   const jewelryId = bagItem.jewelry;

//   const size = bagItem.size;

//   if (bagItem.quantity === DEFAULT_ADD_QUANTITY) {
//     await bagItem.deleteOne();
//   } else {
//     await Bag.findByIdAndUpdate(
//       bagId,
//       { $inc: { quantity: -DEFAULT_ADD_QUANTITY } },
//       { new: true }
//     );
//   }

//   await Inventory.findOneAndUpdate(
//     { jewelry: jewelryId, size },
//     { $inc: { quantity: +DEFAULT_ADD_QUANTITY } },
//     { new: true }
//   );
// };

// exports.increase = async (bagId) => {
//   const bagItem = await Bag.findById(bagId);

//   const jewelryId = bagItem.jewelry;

//   const size = bagItem.size;

//   const isAvailable = await checkIfItemIsAvailable(jewelryId, size);

//   if (!isAvailable) {
//     throw new Error(SOLD_OUT_JEWELRY_ERROR_MESSAGE);
//   }

//   await Bag.findByIdAndUpdate(
//     bagId,
//     { $inc: { quantity: +DEFAULT_ADD_QUANTITY } },
//     { new: true }
//   );

//   await Inventory.findOneAndUpdate(
//     { jewelry: jewelryId, size },
//     { $inc: { quantity: -DEFAULT_ADD_QUANTITY } },
//     { new: true }
//   );
// };

const Bag = require("../models/Bag");
const Inventory = require("../models/Inventory");
const UserLoginDetails = require("../models/UserLoginDetails");

const {
  findBagItemByUser,
  findBagItemsByBagId,
} = require("../utils/findBagItem");
const { updateBagQuantity } = require("../utils/updateBagQuantity");
const { updateInventoryQuantity } = require("../utils/updateInventoryQuantity");

const {
  getAllBagItemsByUserId,
} = require("../aggregations/getAllBagItemsByUserId");

const { checkIfItemIsAvailable } = require("../utils/checkIfItemIsAvailable");

const {
  DEFAULT_ADD_QUANTITY,
  DEFAULT_REMOVE_QUANTITY,
  SOLD_OUT_JEWELRY_ERROR_MESSAGE,
} = require("../constants/bag");

exports.create = async ({ userId, jewelryId, size }) => {
  const isAvailable = await checkIfItemIsAvailable(jewelryId, size);

  if (!isAvailable) {
    throw new Error(SOLD_OUT_JEWELRY_ERROR_MESSAGE);
  }

  const bagItem = await findBagItemByUser(userId, jewelryId, size);

  if (bagItem) {
    await updateBagQuantity(bagItem._id, DEFAULT_ADD_QUANTITY);
  } else {
    await Bag.create({
      user: userId,
      jewelry: jewelryId,
      size,
      quantity: DEFAULT_ADD_QUANTITY,
    });
  }

  await updateInventoryQuantity(jewelryId, size, DEFAULT_REMOVE_QUANTITY);
};

exports.getAll = async (userId) => {
  const user = await UserLoginDetails.findById(userId);

  return getAllBagItemsByUserId(user);
};

exports.delete = async (bagId) => {
  const { bagItem, jewelryId, size, bagQuantity } = await findBagItemsByBagId(
    bagId
  );

  await bagItem.deleteOne();

  await updateInventoryQuantity(jewelryId, size, bagQuantity);
};

exports.decrease = async (bagId) => {
  const { bagItem, jewelryId, size, bagQuantity } = await findBagItemsByBagId(
    bagId
  );

  if (bagQuantity === DEFAULT_ADD_QUANTITY) {
    await bagItem.deleteOne();
  } else {
    await updateBagQuantity(bagItem._id, DEFAULT_REMOVE_QUANTITY);
  }

  await updateInventoryQuantity(jewelryId, size, DEFAULT_ADD_QUANTITY);
};

exports.increase = async (bagId) => {
  const { bagItem, jewelryId, size, bagQuantity } = await findBagItemsByBagId(
    bagId
  );

  const isAvailable = await checkIfItemIsAvailable(jewelryId, size);

  if (!isAvailable) {
    throw new Error(SOLD_OUT_JEWELRY_ERROR_MESSAGE);
  }

  await updateBagQuantity(bagItem._id, DEFAULT_ADD_QUANTITY);

  await updateInventoryQuantity(jewelryId, size, DEFAULT_REMOVE_QUANTITY);
};
