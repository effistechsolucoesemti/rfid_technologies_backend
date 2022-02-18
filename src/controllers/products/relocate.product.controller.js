import { database } from "../../services/firebase.js";
import { ref, get, push, update, remove } from "@firebase/database";

const RelocateProduct = async (request, response) => {
  console.log("triggered");

  const { senderIdToken, productRfid, receiverIdToken } = request.body;

  let senderKey = "";
  let sendedProductKey = "";
  let receiverKey = "";

  //Sended Product Data
  let sendedProductName = "";
  let sendedProductAttributeSet = "";
  let sendedProductBrand = "";
  let sendedProductCategory = "";
  let sendedProductGenre = "";
  let sendedProductIdPiece = "";
  let sendedProductRfidTag = "";
  let sendedProductInternalNumber = "";
  let sendedProductQuantity = "";
  let sendedProductPhoto = "";

  console.log(senderIdToken + " - " + productRfid + " - " + receiverIdToken);
  try {
    const getUsers = get(ref(database, "users")).then((snapshot) => {
      return snapshot.val();
    });

    const getSenderUser = getUsers.then((result) => {
      const userGroup = Object.entries(result);

      for (const [key, user] of userGroup) {
        if (user.id_token === senderIdToken) {
          senderKey = key;
          return user;
        }
      }
    });

    const getReceiverUser = getUsers.then((result) => {
      const userGroup = Object.entries(result);

      for (const [key, user] of userGroup) {
        if (user.id_token === receiverIdToken) {
          receiverKey = key;
          return user;
        }
      }
    });

    getSenderUser.then(async (senderUser) => {
      //Check if Sender User exists
      if (!senderUser) {
        return response.status(409).send("Sender User does not exist!");
      }

      //Check if Sender User has any item available (Table of Products os created)
      if (!senderUser.table_of_products) {
        return response
          .status(409)
          .send("Please, verify if Sender User has any item registered!");
      }

      //Check if the selected product exists
      const itemExists = Object.entries(senderUser.table_of_products)
        .filter(([key, item]) => {
          if (item.rfid_tag === productRfid) {
            sendedProductKey = key;
            sendedProductName = item.product_name;
            sendedProductAttributeSet = item.attribute_set;
            sendedProductBrand = item.brand;
            sendedProductCategory = item.category;
            sendedProductGenre = item.genre;
            sendedProductIdPiece = item.id_piece;
            sendedProductRfidTag = item.rfid_tag;
            sendedProductInternalNumber = item.internal_number;
            sendedProductQuantity = item.quantity;
            sendedProductPhoto = item.photo;
            return item;
          }
        })
        .flatMap(([key, res]) => {
          return res;
        });

      if (!itemExists.length > 0) {
        return response
          .status(409)
          .send("The selected product does not exists!");
      }

      //Check if Sender User has any quantity available for transference
      if (itemExists.quantity <= 0) {
        return response
          .status(409)
          .send(
            "The selected product has 0 quantities available in the Sender User stockc."
          );
      }

      //Check if receiver user exists
      const receiverUserExists = await getReceiverUser.then((user) => {
        console.log({ getReceiverUser: user });
        return user;
      });

      console.log({ receiverUserExists });

      if (!receiverUserExists) {
        return response.status(409).send("Receiver User does not exist!");
      }

      //Delete product from sender
      remove(
        ref(
          database,
          `users/${senderKey}/table_of_products/${sendedProductKey}`
        )
      ).then(() => {
        //Push to Sender Table of Logs
        push(ref(database, `users/${senderKey}/table_of_logs`), {
          date: String(new Date().toISOString()),
          operation: "transfered deleted",
          product: sendedProductName,
          state: {
            attribute_set: {
              previousState: sendedProductAttributeSet,
              currentState: sendedProductAttributeSet,
            },
            brand: {
              previousState: sendedProductBrand,
              currentState: sendedProductBrand,
            },
            category: {
              previousState: sendedProductCategory,
              currentState: sendedProductCategory,
            },
            genre: {
              previousState: sendedProductGenre,
              currentState: sendedProductGenre,
            },
            id_piece: {
              previousState: sendedProductIdPiece,
              currentState: sendedProductIdPiece,
            },
            id_token: {
              previousState: senderIdToken,
              currentState: receiverIdToken,
            },
            internal_number: {
              previousState: sendedProductInternalNumber,
              currentState: sendedProductInternalNumber,
            },
            product_name: {
              previousState: sendedProductName,
              currentState: sendedProductName,
            },
            quantity: {
              previousState: sendedProductQuantity,
              currentState: sendedProductQuantity,
            },
            rfid_tag: {
              previousState: sendedProductRfidTag,
              currentState: sendedProductRfidTag,
            },
          },
        });
      });

      get(ref(database, `users/${receiverKey}/table_of_products`)).then(
        (snapshot) => {
          //If Receiver User Table of Product doesn't exist
          if (!snapshot.val()) {
            console.log("Creating Table of Products of Receiver User!");
            //Push to Table of Products
            push(ref(database, `users/${receiverKey}/table_of_products`), {
              id_token: receiverIdToken,
              internal_number: sendedProductInternalNumber,
              rfid_tag: sendedProductRfidTag,
              photo: sendedProductPhoto,
              id_piece: sendedProductIdPiece,
              product_name: sendedProductName,
              genre: sendedProductGenre,
              attribute_set: sendedProductAttributeSet,
              category: sendedProductCategory,
              brand: sendedProductCategory,
              quantity: sendedProductQuantity,
            });
            //Push to Table of Logs
            push(ref(database, `users/${receiverKey}/table_of_logs`), {
              date: String(new Date().toISOString()),
              operation: "transfered new",
              product: sendedProductName,
              state: {
                attribute_set: {
                  previousState: sendedProductAttributeSet,
                  currentState: sendedProductAttributeSet,
                },
                brand: {
                  previousState: sendedProductBrand,
                  currentState: sendedProductBrand,
                },
                category: {
                  previousState: sendedProductCategory,
                  currentState: sendedProductCategory,
                },
                genre: {
                  previousState: sendedProductGenre,
                  currentState: sendedProductGenre,
                },
                id_piece: {
                  previousState: sendedProductIdPiece,
                  currentState: sendedProductIdPiece,
                },
                id_token: {
                  previousState: senderIdToken,
                  currentState: receiverIdToken,
                },
                internal_number: {
                  previousState: sendedProductInternalNumber,
                  currentState: sendedProductInternalNumber,
                },
                product_name: {
                  previousState: sendedProductName,
                  currentState: sendedProductName,
                },
                quantity: {
                  previousState: sendedProductQuantity,
                  currentState: sendedProductQuantity,
                },
                rfid_tag: {
                  previousState: sendedProductRfidTag,
                  currentState: sendedProductRfidTag,
                },
              },
            });

            return response
              .status(201)
              .send("Product transfered with success.");
          }

          //If Receiver User Table of Product exist
          snapshot.forEach((childSnapshot) => {
            //Check for item already registered and update it
            const receiverProductKey = childSnapshot.key;
            const receiverProductData = childSnapshot.val();

            if (receiverProductData.rfid_tag === productRfid) {
              update(
                ref(
                  database,
                  `users/${receiverKey}/table_of_products/${receiverProductKey}`
                ),
                {
                  quantity:
                    receiverProductData.quantity + sendedProductQuantity,
                }
              ).then(() => {
                //Push to Table of Logs
                push(ref(database, `users/${receiverKey}/table_of_logs`), {
                  date: String(new Date().toISOString()),
                  operation: "transfered new",
                  product: sendedProductName,
                  state: {
                    attribute_set: {
                      previousState: sendedProductAttributeSet,
                      currentState: sendedProductAttributeSet,
                    },
                    brand: {
                      previousState: sendedProductBrand,
                      currentState: sendedProductBrand,
                    },
                    category: {
                      previousState: sendedProductCategory,
                      currentState: sendedProductCategory,
                    },
                    genre: {
                      previousState: sendedProductGenre,
                      currentState: sendedProductGenre,
                    },
                    id_piece: {
                      previousState: sendedProductIdPiece,
                      currentState: sendedProductIdPiece,
                    },
                    id_token: {
                      previousState: senderIdToken,
                      currentState: receiverIdToken,
                    },
                    internal_number: {
                      previousState: sendedProductInternalNumber,
                      currentState: sendedProductInternalNumber,
                    },
                    product_name: {
                      previousState: sendedProductName,
                      currentState: sendedProductName,
                    },
                    quantity: {
                      previousState: sendedProductQuantity,
                      currentState: sendedProductQuantity,
                    },
                    rfid_tag: {
                      previousState: sendedProductRfidTag,
                      currentState: sendedProductRfidTag,
                    },
                  },
                });
              });

              return response
                .status(201)
                .send("Product transfered with success.");
            }
          });

          push(ref(database, `users/${receiverKey}/table_of_products`), {
            id_token: receiverIdToken,
            internal_number: sendedProductInternalNumber,
            rfid_tag: sendedProductRfidTag,
            photo: sendedProductPhoto,
            id_piece: sendedProductIdPiece,
            product_name: sendedProductName,
            genre: sendedProductGenre,
            attribute_set: sendedProductAttributeSet,
            category: sendedProductCategory,
            brand: sendedProductCategory,
            quantity: sendedProductQuantity,
          }).then(() => {
            push(ref(database, `users/${receiverKey}/table_of_logs`), {
              date: String(new Date().toISOString()),
              operation: "transfered new",
              product: sendedProductName,
              state: {
                attribute_set: {
                  previousState: sendedProductAttributeSet,
                  currentState: sendedProductAttributeSet,
                },
                brand: {
                  previousState: sendedProductBrand,
                  currentState: sendedProductBrand,
                },
                category: {
                  previousState: sendedProductCategory,
                  currentState: sendedProductCategory,
                },
                genre: {
                  previousState: sendedProductGenre,
                  currentState: sendedProductGenre,
                },
                id_piece: {
                  previousState: sendedProductIdPiece,
                  currentState: sendedProductIdPiece,
                },
                id_token: {
                  previousState: senderIdToken,
                  currentState: receiverIdToken,
                },
                internal_number: {
                  previousState: sendedProductInternalNumber,
                  currentState: sendedProductInternalNumber,
                },
                product_name: {
                  previousState: sendedProductName,
                  currentState: sendedProductName,
                },
                quantity: {
                  previousState: sendedProductQuantity,
                  currentState: sendedProductQuantity,
                },
                rfid_tag: {
                  previousState: sendedProductRfidTag,
                  currentState: sendedProductRfidTag,
                },
              },
            });
          });

          return response.status(201).send("Product transfered with success.");
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

export default RelocateProduct;
