import { database } from "../../services/firebase.js";
import {
  ref,
  update,
  get,
  query,
  orderByValue,
  orderByKey,
  child,
} from "@firebase/database";

import { handleEmptyProductsFieldsVerification } from "../../utils/controller/emptyFieldsVerification.js";

export const UpdateProduct = async (request, response) => {
  console.log("Update Product Method");
  const product_key = request.params.product_key;
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

    const usersRef = ref(database, "users/");

    return await get(usersRef).then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const userKey = childSnapshot.key;
        const userData = childSnapshot.val();

        if (userData.id_token === id_token) {
          const fetchInternalNumber = get(
            ref(database, `users/${userKey}/table_of_products/`)
          )
            .then((results) => {
              const productResult = results.forEach((product) => {
                const productKey = product.key;
                const productData = product.val();

                console.log({
                  productKey,
                  product_key,
                  productData,
                  ref: product.ref.toString().substring(61),
                  child: product
                    .child(product.ref.toString().substring(61))
                    .val(),
                  // hasChild: product.hasChild(),
                  // hasChildren: product.hasChildren(),
                });

                if (
                  productData.internal_number === internal_number &&
                  internal_number !== current_internal_number
                ) {
                  //Retorna true
                  return get(
                    ref(
                      database,
                      `/users/${userKey}/table_of_products/${product_key}`
                    )
                  );
                }
              });

              if (!productResult) {
                return response.status(400).send({
                  status: "failed",
                  message: "Product already registered!",
                });
              }

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
                  ...remainder_attributes,
                }
              ).then(() => {
                response.status(200).json({
                  status: "success",
                  message: `Product ${product_name} was updated!`,
                });
              });
            })
            .catch((error) => {
              console.log({ error });
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
  const { id_token, rfid_tag, quantity } = request.body;

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
