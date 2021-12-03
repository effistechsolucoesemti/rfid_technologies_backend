export const handleEmptyUserFieldsVerification = (
  response,
  username,
  password,
  email
) => {
  if (!username || !password) {
    return response.status(400).send({
      status: "failed",
      message: "Missing fields. - Please, confirm your credentials.",
    });
  }
  return;
};

export const handleEmptyProductsFieldsVerification = (
  response,
  id_token,
  rfid_tag,
  internal_number,
  product_name,
  quantity
) => {
  if (!id_token) {
    return response
      .status(400)
      .send({ status: "failed", message: "Id Token field empty" });
  }

  if (!product_name) {
    return response
      .status(400)
      .send({ status: "failed", message: "Product Name field empty" });
  }

  if (!internal_number) {
    return response
      .status(400)
      .send({ status: "failed", message: "Internal Number field empty" });
  }

  if (!rfid_tag) {
    return response
      .status(400)
      .send({ status: "failed", message: "RFid Tag field empty" });
  }

  if (!quantity) {
    return response
      .status(400)
      .send({ status: "failed", message: "Quantity field empty" });
  }

  return;
};
