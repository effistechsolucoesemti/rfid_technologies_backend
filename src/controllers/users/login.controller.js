import { database } from "../../services/firebase.js";
import { onValue, ref } from "@firebase/database";

import bcrypt from "bcrypt";

import { handleEmptyUserFieldsVerification } from "../../utils/controller/emptyFieldsVerification.js";

const Login = (request, response) => {
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

    const usersRef = ref(database, "users/");

    return onValue(usersRef, (snapshot) => {
      const userData = snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();

        if (
          childData.username === username &&
          bcrypt.compare(password, childData.password)
        ) {
          return response.status(200).send({
            status: "success",
            message: "User founded!",
            id_token: childData.id_token,
          });
        }
        return;
      });

      if (!userData) {
        response.status(409).end();
        return;
      }

      return;
    });
  } catch (error) {
    console.error(error);
  }
};

export default Login;
