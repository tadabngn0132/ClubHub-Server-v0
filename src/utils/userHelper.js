export const removeSensitiveUserData = (user) => {
  const {
    hashedPassword,
    googleId,
    refreshTokens,
    resetToken,
    ...neccesaryUserData
  } = user

  return neccesaryUserData
}