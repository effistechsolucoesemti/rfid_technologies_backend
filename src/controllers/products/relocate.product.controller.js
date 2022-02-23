import { database } from "../../services/firebase.js";
import { ref, get, push, update, remove } from "@firebase/database";

const RelocateProduct = async (request, response) => {
  console.log("triggered");

  const { senderIdToken, productRfid, quantity, receiverIdToken } =
    request.body;

  let senderKey = "";
  let sendedProductKey = "";
  let sendedQuantity = "";
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

  console.log(
    senderIdToken +
      " - " +
      productRfid +
      " - " +
      quantity +
      " - " +
      receiverIdToken
  );
  try {
    const getUsers = await get(ref(database, "users")).then((users) => {
      return users.val();
    });

    const getSenderUser = Object.entries(getUsers)
      .filter(([key, user]) => {
        if (user.id_token === senderIdToken) {
          senderKey = key;
          return user;
        }
      })
      .flatMap(([key, user]) => {
        return user;
      });

    if (!getSenderUser[0]) {
      return response.status(409).send("Sender User does not exist!");
    }

    const product = getSenderUser.flatMap((dataValue) => {
      return Object.entries(dataValue.table_of_products)
        .filter(([key, product]) => {
          if (product.rfid_tag === productRfid) {
            //Assign Product Key
            sendedProductKey = key;

            //Assign Product Data
            sendedProductName = product.product_name;
            sendedProductAttributeSet = product.attribute_set;
            sendedProductBrand = product.brand;
            sendedProductCategory = product.category;
            sendedProductGenre = product.genre;
            sendedProductIdPiece = product.id_piece;
            sendedProductRfidTag = product.rfid_tag;
            sendedProductInternalNumber = product.internal_number;
            sendedProductQuantity = product.quantity;
            sendedProductPhoto = product.photo;

            return product;
          }
        })
        .flatMap(([key, product]) => {
          return product;
        });
    });

    if (product <= 0) {
      return response
        .status(409)
        .send("Please, verify if Sender User has any item registered!");
    }

    if (product[0].quantity <= 0) {
      return response
        .status(409)
        .send(
          "The selected product has 0 quantities available in the Sender User stock."
        );
    }

    if (product[0].quantity < quantity) {
      return response
        .status(409)
        .send("The selected product does not have this quantity available.");
    }

    const getReceiverUser = Object.entries(getUsers)
      .filter(([key, user]) => {
        if (user.id_token === receiverIdToken) {
          receiverKey = key;
          return user;
        }
      })
      .flatMap(([key, user]) => {
        return user;
      });

    if (!getReceiverUser[0]) {
      return response.status(409).send("Receiver User does not exist!");
    }

    //Update to Decrease Quantity
    update(
      ref(database, `users/${senderKey}/table_of_products/${sendedProductKey}`),
      { quantity: sendedProductQuantity - quantity }
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
      (tableOfProduct) => {
        //Check if Receiver User has a Table of Products
        if (!tableOfProduct.exists()) {
          //Create a NEW Table of Product if Receiver User doesnt have one
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
            quantity: quantity,
          }).then(() => {
            //Create a new Table of Logs
            push(ref(database, `users/${receiverKey}/table_of_logs`), {
              date: String(new Date().toISOString()),
              operation: "transfered new",
              product: sendedProductName,
              state: {
                attribute_set: {
                  previousState: null,
                  currentState: sendedProductAttributeSet,
                },
                brand: {
                  previousState: null,
                  currentState: sendedProductBrand,
                },
                category: {
                  previousState: null,
                  currentState: sendedProductCategory,
                },
                genre: {
                  previousState: null,
                  currentState: sendedProductGenre,
                },
                id_piece: {
                  previousState: null,
                  currentState: sendedProductIdPiece,
                },
                id_token: {
                  previousState: null,
                  currentState: receiverIdToken,
                },
                internal_number: {
                  previousState: null,
                  currentState: sendedProductInternalNumber,
                },
                product_name: {
                  previousState: null,
                  currentState: sendedProductName,
                },
                quantity: {
                  previousState: null,
                  currentState: sendedProductQuantity,
                },
                rfid_tag: {
                  previousState: null,
                  currentState: sendedProductRfidTag,
                },
              },
            });
            response.status(201).send("Product transfered with success.");
          });
        }

        //If Receiver User Table of Products already created
        const updatedProduct = tableOfProduct.forEach((product) => {
          const receiverProductKey = product.key;
          const receiverProductData = product.val();

          if (receiverProductData.rfid_tag === productRfid) {
            return update(
              ref(
                database,
                `users/${receiverKey}/table_of_products/${receiverProductKey}`
              ),
              {
                quantity:
                  Number(receiverProductData.quantity) + Number(quantity),
              }
            ).then(() => {
              push(ref(database, `users/${receiverKey}/table_of_logs`), {
                date: String(new Date().toISOString()),
                operation: "transfered new",
                product: sendedProductName,
                state: {
                  attribute_set: {
                    previousState: null,
                    currentState: sendedProductAttributeSet,
                  },
                  brand: {
                    previousState: null,
                    currentState: sendedProductBrand,
                  },
                  category: {
                    previousState: null,
                    currentState: sendedProductCategory,
                  },
                  genre: {
                    previousState: null,
                    currentState: sendedProductGenre,
                  },
                  id_piece: {
                    previousState: null,
                    currentState: sendedProductIdPiece,
                  },
                  id_token: {
                    previousState: null,
                    currentState: receiverIdToken,
                  },
                  internal_number: {
                    previousState: null,
                    currentState: sendedProductInternalNumber,
                  },
                  product_name: {
                    previousState: null,
                    currentState: sendedProductName,
                  },
                  quantity: {
                    previousState: null,
                    currentState: sendedProductQuantity,
                  },
                  rfid_tag: {
                    previousState: null,
                    currentState: sendedProductRfidTag,
                  },
                },
              });
              return response
                .status(201)
                .send("Product transfered with success.");
            });
          }
        });

        console.log(updatedProduct);

        if (!updatedProduct) {
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
            quantity: quantity,
          }).then(() => {
            push(ref(database, `users/${receiverKey}/table_of_logs`), {
              date: String(new Date().toISOString()),
              operation: "transfered new",
              product: sendedProductName,
              state: {
                attribute_set: {
                  previousState: null,
                  currentState: sendedProductAttributeSet,
                },
                brand: {
                  previousState: null,
                  currentState: sendedProductBrand,
                },
                category: {
                  previousState: null,
                  currentState: sendedProductCategory,
                },
                genre: {
                  previousState: null,
                  currentState: sendedProductGenre,
                },
                id_piece: {
                  previousState: null,
                  currentState: sendedProductIdPiece,
                },
                id_token: {
                  previousState: null,
                  currentState: receiverIdToken,
                },
                internal_number: {
                  previousState: null,
                  currentState: sendedProductInternalNumber,
                },
                product_name: {
                  previousState: null,
                  currentState: sendedProductName,
                },
                quantity: {
                  previousState: null,
                  currentState: sendedProductQuantity,
                },
                rfid_tag: {
                  previousState: null,
                  currentState: sendedProductRfidTag,
                },
              },
            });
          });
          return response.status(201).send("Product transfered with success.");
        }
      }
    );

    /**/
  } catch (error) {
    console.log(error);
  }
};

export default RelocateProduct;
