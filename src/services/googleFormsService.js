import { withUserGoogleForms } from "./googleAuthContextService";

export const createGoogleForm = async (userId, title) => {
  return withUserGoogleForms(userId, async (googleForms) => {
    const response = await googleForms.forms.create({
      requestBody: {
        title,
      },
      fields: "formId,title,createdTime,modifiedTime",
    });
    return response.data;
  });
};

