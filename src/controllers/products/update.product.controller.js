import { database } from "../../services/firebase.js";
import { ref, update, get, push } from "@firebase/database";

import { csvStringToJson } from "convert-csv-to-json";

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
  try {
    console.log("CALLING UPDATE TABLE BY IMPORT");
    const { file, user_id_token } = request.body;

    let products = [];

    if (!file) {
      console.log({ b: file });
      return response.status(409).send("Please, insert a valid file!");
    }

    let fileSplited = String(file)
      .trim()
      .split("\r\n")
      .map((elem) => {
        return elem;
      });

    let attributes = fileSplited[0].split(";");
    let valuesArray = [];

    for (let index = 0; index < fileSplited.length; index++) {
      if (index > 0) {
        valuesArray.push(fileSplited[index].split(";"));
      }
    }

    let objectFormatted = valuesArray.map((elem, firstIndex) => {
      let mapped = attributes.map((att, index) => {
        return Object.assign({}, { [att]: elem[index] });
      });

      return Object.assign({}, ...mapped);
    });

    // console.log("+++++");
    // console.log(csvStringToJson(file));
    // console.log("+++++");

    let getUsers = await get(ref(database, "users/")).then((users) => {
      return users.val();
    });

    let userKey = "";

    Object.entries(getUsers).map(([key, user]) => {
      if (user.id_token === user_id_token) {
        userKey = key;

        return;
      }
    });

    let getProducts = await get(
      ref(database, `users/${userKey}/table_of_products`)
    ).then((products) => {
      return products.val();
    });

    //Check if Table of Products was created
    if (!getProducts) {
      console.log("Table of products not created - " + getProducts);

      Object.entries(objectFormatted).forEach(([key, value]) => {
        push(ref(database, `users/${userKey}/table_of_products`), {
          product_name: Object.entries(value).at(0)[1],
          internal_number: Object.entries(value).at(1)[1],
          rfid_tag: Object.entries(value).at(2)[1],
          quantity: Object.entries(value).at(3)[1],

          attribute_set: Object.entries(value).at(4)[1],
          brand: Object.entries(value).at(5)[1],
          category: Object.entries(value).at(6)[1],
          genre: Object.entries(value).at(7)[1],
          id_piece: Object.entries(value).at(8)[1],
          id_token: user_id_token,
        });
      });

      return response.status(201).send("Updated");
    }

    products = Object.entries(getProducts).map((product) => {
      return product;
    });

    // console.log(products);

    objectFormatted.forEach((object) => {
      let wasUpdated = products.find(([key, value]) => {
        if (Object.entries(object).at(2)[1] === value.rfid_tag) {
          //RFidTag === rfid_tag
          return update(
            ref(database, `users/${userKey}/table_of_products/${key}`),
            {
              product_name: Object.entries(object).at(0)[1] + "11111",
              internal_number: Object.entries(object).at(1)[1],
              rfid_tag: Object.entries(object).at(2)[1],
              quantity: Object.entries(object).at(3)[1],

              attribute_set: Object.entries(object).at(4)[1],
              brand: Object.entries(object).at(5)[1],
              category: Object.entries(object).at(6)[1],
              genre: Object.entries(object).at(7)[1],
              id_piece: Object.entries(object).at(8)[1],
              id_token: user_id_token,
            }
          );
        }
      });

      if (!wasUpdated) {
        push(ref(database, `users/${userKey}/table_of_products`), {
          product_name: Object.entries(object).at(0)[1],
          internal_number: Object.entries(object).at(1)[1],
          rfid_tag: Object.entries(object).at(2)[1],
          quantity: Object.entries(object).at(3)[1],

          attribute_set: Object.entries(object).at(4)[1],
          brand: Object.entries(object).at(5)[1],
          category: Object.entries(object).at(6)[1],
          genre: Object.entries(object).at(7)[1],
          id_piece: Object.entries(object).at(8)[1],
          id_token: user_id_token,
        });
      }
    });

    return response.status(201).send("Updated");
  } catch (error) {
    console.log(error);
  }
};
