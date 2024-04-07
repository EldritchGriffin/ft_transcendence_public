export const verifyPasswords = (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  } else if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  } else if (password[0] === " ") {
    throw new Error("Password cannot start with a space");
  }
};

export const verifyName = (name: string) => {
  if (name.length < 3) {
    throw new Error("Name must be at least 3 characters");
  }
  if (name[0] === " ") {
    throw new Error("Name cannot start with a space");
  }
  if (name.length > 20) {
    throw new Error("Name cannot be longer than 20 characters");
  }
  if (name.match(/[^a-zA-Z0-9\s]/)) {
    throw new Error("Name cannot contain special characters");
  }
  if (!name.match(/[a-zA-Z]/)) {
    throw new Error("Name must start with a letter");
  }
};
