import { database } from "../../services/firebase.js";
import { onValue, ref, get } from "@firebase/database";

import bcrypt from "bcrypt";

import { handleEmptyUserFieldsVerification } from "../../utils/controller/emptyFieldsVerification.js";

const Login = async (request, response) => {
  console.log("CALLING LOGIN METHOD");

  const { username, password, email } = request.body;

  try {
    const emptyFields = handleEmptyUserFieldsVerification(
      response,
      username,
      password
    );

    if (emptyFields) {
      return;
    }

    return await get(ref(database, "users/")).then((snapshot) => {
      const result = snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();

        const passwordResult = bcrypt.compareSync(password, userData.password);

        if (userData.username === username && passwordResult) {
          return response.status(200).send({
            status: "success",
            message: "User founded!",
            id_token: userData.id_token,
          });
        }
      });

      if (!result) {
        return response.status(409).end();
      }
    });

    // return onValue(usersRef, (snapshot) => {
    //   const userData = snapshot.forEach((childSnapshot) => {
    //     const childData = childSnapshot.val();

    //     console.log({ password, CDP: childData.password });
    //     if (
    //       childData.username === username &&
    //       bcrypt.compare(password, childData.password)
    //     ) {
    //       console.log(bcrypt.compare(password, childData.password));

    //       return response.status(200).send({
    //         status: "success",
    //         message: "User founded!",
    //         id_token: childData.id_token,
    //       });
    //     }
    //     return false;
    //   });

    //   console.log({ userData });

    //   if (!userData) {
    //     return response.status(409).end();
    //   }

    //   return;
    // });
  } catch (error) {
    console.error(error);
  }
};

export default Login;
