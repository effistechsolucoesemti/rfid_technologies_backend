import { database } from "../../services/firebase.js";
import { ref, update, get } from "@firebase/database";

import { handleEmptyProductsFieldsVerification } from "../../utils/controller/emptyFieldsVerification.js";

const UpdateProduct = async (request, response) => {
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

                if (
                  productData.internal_number === internal_number &&
                  internal_number !== current_internal_number
                ) {
                  return get(
                    ref(
                      database,
                      `/users/${userKey}/table_of_products/${product_key}`
                    )
                  );
                }
              });

              console.log({ prodValOf: productResult.valueOf() });

              if (productResult) {
                response.status(400).send({
                  status: "failed",
                  message: "Product already registered!.",
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

export default UpdateProduct;
