import { database } from "../../services/firebase.js";
import { onValue, push, ref } from "@firebase/database";

import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

import { handleEmptyUserFieldsVerification } from "../../utils/controller/emptyFieldsVerification.js";

const RegisterUser = (request, response) => {
  console.log("RegisterUser");
  const { username, password, email, company, telephone } = request.body;

  try {
    const emptyFields = handleEmptyUserFieldsVerification(
      response,
      username,
      password,
      email
    );

    if (emptyFields) {
      return;
    }

    const usersRef = ref(database, "users/");

    return onValue(
      usersRef,
      async (snapshot) => {
        const userRegister = snapshot.forEach((childSnapshot) => {
          const childData = childSnapshot.val();

          if (childData.username === username || childData.email === email) {
            return response.status(400).send({
              status: "failed",
              error: "Username or e-mail already registered!",
            });
          }
        });

        if (userRegister) {
          return;
        }

        await push(ref(database, `users/`), {
          id_token: uuidv4(),
          username,
          password: await bcrypt.hash(password, 11),
          email,
          company,
          telephone,
        }).then(() => {
          return response.status(200).send({
            status: "success",
            message: "User registered successfully",
            data: request.body,
          });
        });
      },
      {
        onlyOnce: true,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export default RegisterUser;
