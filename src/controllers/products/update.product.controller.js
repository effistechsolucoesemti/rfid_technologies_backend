import { database } from "../../services/firebase.js";
import { ref, update, get, push } from "@firebase/database";

import { handleEmptyProductsFieldsVerification } from "../../utils/controller/emptyFieldsVerification.js";

export const UpdateProduct = async (request, response) => {
  console.log("CALLING UPDATE PRODUCT METHOD");

  const product_key = request.params.product_key;
  const {
    id_token,
    rfid_tag,
    internal_number,
    current_internal_number,
    product_name,
    quantity,
    genre,
    category,
    photo,
    attribute_set,
    brand,
    id_piece,
  } = request.body;

  try {
    const emptyFields = handleEmptyProductsFieldsVerification(
      response,
      id_token,
      rfid_tag,
      internal_number,
      product_name,
      quantity
    );

    if (emptyFields) {
      return;
    }

    return await get(ref(database, "users/")).then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const userKey = childSnapshot.key;
        const userData = childSnapshot.val();

        if (userData.id_token === id_token) {
          const fetchInternalNumber = get(
            ref(database, `users/${userKey}/table_of_products/`)
          )
            .then((results) => {
              //Verify if is itself
              if (internal_number === current_internal_number) {
                //Register a new Log
                push(ref(database, `users/${userKey}/table_of_logs`), {
                  date: String(new Date().toISOString()),
                  operation: "updated",
                  // message: `Product ${product_name} was updated!`,

                  product: userData.product_name,
                  state: {
                    attribute_set: {
                      previousState: attribute_set,
                      currentState: userData.attribute_set,
                    },
                    brand: {
                      previousState: brand,
                      currentState: userData.brand,
                    },
                    category: {
                      previousState: category,
                      currentState: userData.category,
                    },
                    genre: {
                      previousState: genre,
                      currentState: userData.genre,
                    },
                    id_piece: {
                      previousState: id_piece,
                      currentState: userData.id_piece,
                    },
                    id_token: {
                      previousState: id_token,
                      currentState: userData.id_token,
                    },
                    internal_number: {
                      previousState: internal_number,
                      currentState: userData.internal_number,
                    },
                    product_name: {
                      previousState: product_name,
                      currentState: userData.product_name,
                    },
                    quantity: {
                      previousState: quantity,
                      currentState: userData.quantity,
                    },
                    rfid_tag: {
                      previousState: rfid_tag,
                      currentState: userData.quantity,
                    },
                  },
                });

                return update(
                  ref(
                    database,
                    `/users/${userKey}/table_of_products/${product_key}`
                  ),
                  {
                    user_token: id_token,
                    rfid_tag,
                    internal_number,
                    product_name,
                    quantity,
                    genre,
                    category,
                    photo,
                    attribute_set,
                    brand,
                    id_piece,
                  }
                )
                  .then(() => {
                    return response.status(200).json({
                      status: "success",
                      message: `Product ${product_name} was updated!`,
                    });
                  })
                  .catch((error) => {
                    console.log({ error });
                    throw new Error(error);
                  });
              }

              const productResult = results.forEach((product) => {
                const productData = product.val();

                //Verify if another product is registered and send error message
                if (productData.internal_number === internal_number) {
                  return false;
                }
              });

              if (!productResult) {
                return response.status(400).send({
                  status: "failed",
                  message: "Another product is already registered!",
                });
              }

              //Register a new Log
              push(ref(database, `users/${userKey}/table_of_logs`), {
                date: String(new Date().toISOString()),
                operation: "updated",
                product: userData.product_name,
                state: {
                  attribute_set: {
                    previousState: attribute_set,
                    currentState: userData.attribute_set,
                  },
                  brand: {
                    previousState: brand,
                    currentState: userData.brand,
                  },
                  category: {
                    previousState: category,
                    currentState: userData.category,
                  },
                  genre: {
                    previousState: genre,
                    currentState: userData.genre,
                  },
                  id_piece: {
                    previousState: id_piece,
                    currentState: userData.id_piece,
                  },
                  id_token: {
                    previousState: id_token,
                    currentState: userData.id_token,
                  },
                  internal_number: {
                    previousState: internal_number,
                    currentState: userData.internal_number,
                  },
                  product_name: {
                    previousState: product_name,
                    currentState: userData.product_name,
                  },
                  quantity: {
                    previousState: quantity,
                    currentState: userData.quantity,
                  },
                  rfid_tag: {
                    previousState: rfid_tag,
                    currentState: userData.quantity,
                  },
                },
              });

              return update(
                ref(
                  database,
                  `/users/${userKey}/table_of_products/${product_key}`
                ),
                {
                  user_token: id_token,
                  rfid_tag,
                  internal_number,
                  product_name,
                  quantity,
                  genre,
                  category,
                  photo,
                  attribute_set,
                  brand,
                  id_piece,
                }
              )
                .then(() => {
                  return response.status(200).json({
                    status: "success",
                    message: `Product ${product_name} was updated!`,
                  });
                })
                .catch((error) => {
                  console.log({ error });
                  throw new Error(error);
                });
            })
            .catch((error) => {
              console.log({ error });
              throw new Error(error);
            });

          if (!fetchInternalNumber) {
            response.status(400).send({
              status: "failed",
              message: "Internal Number not founded!",
            });
          }
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateProductQuantityByRFidTag = (request, response) => {
  console.log("CALLING UPDATE PRODUCT QUANTITY BY RFID METHOD");

  const {
    id_token,
    rfid_tag,
    internal_number,
    current_internal_number,
    product_name,
    quantity,
    ...remainder_attributes
  } = request.body;

  try {
    const usersRef = ref(database, "users/");

    get(usersRef)
      .then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const userKey = childSnapshot.key;
          const userData = childSnapshot.val();

          if (userData.id_token === id_token) {
            return get(ref(database, `users/${userKey}/table_of_products`))
              .then((product) => {
                const productData = product.val();

                Object.entries(productData).forEach((element) => {
                  if (element[1].rfid_tag === rfid_tag) {
                    let productName = element[1].product_name;

                    update(
                      ref(
                        database,
                        `users/${userKey}/table_of_products/${element[0]}`
                      ),
                      { quantity }
                    )
                      .then(() => {
                        return response.status(200).send({
                          status: "success",
                          message: `Quantity of product of Rfid: ${rfid_tag} was updated!`,
                        });
                      })
                      .catch((error) => {
                        console.log({ error });

                        return response.status(400).json({
                          status: "failed",
                          message: `Was not possible to update product!`,
                        });
                      });

                    //Register a new Log
                    push(ref(database, `users/${userKey}/table_of_logs`), {
                      date: String(new Date().toISOString()),
                      operation: "updated",
                      message: `Product ${productName} was updated!`,
                    });
                  }
                });
              })
              .catch((error) => {
                console.log({ error });
              });
          }
        });
      })
      .catch((error) => {
        console.log({ error });
      });
  } catch (error) {
    console.log({ error });
  }
};

export const updateTableByImport = async (request, response) => {
  console.log("TRIGGERED");

  const obj = request.body;

  // console.log(obj.table_of_products);
  Object.entries(obj.table_of_products).map(async ([key, value]) => {
    let productKey = key;
    const id_token = value.id_token;

    let originalQuantity = "";

    const userKey = await get(ref(database, "/users")).then((snapshot) => {
      const userJSON = snapshot.toJSON();

      const key = Object.entries(userJSON)
        .filter(([key, user]) => {
          if (user.id_token === id_token) {
            return user.id_token;
          }
        })
        .flatMap(([key, value]) => {
          return key;
        });

      return key;
    });

    update(
      ref(database, `users/${userKey[0]}/table_of_products/${productKey}`),
      {
        attribute_set: value.attribute_set,
        brand: value.brand,
        category: value.category,
        genre: value.genre,
        id_piece: value.id_piece,
        internal_number: value.internal_number,
        product_name: value.product_name,
        quantity: value.quantity,
        rfid_tag: value.rfid_tag,
      }
    );
  });
};
