export const types = {};

export enum Providers { 
  Google = `Google` ,
  Firebase = `Firebase`, 
}

export enum Roles {
  Guest = `Guest`,
  Subscriber = `Subscriber`,
  Editor = `Editor`,
  Moderator = `Moderator`,
  Administrator = `Administrator`,
  Developer = `Developer`,
  Owner = `Owner`,
}

export enum Types {
    Data = `Data`,
    User = `User`,
    Chat = `Chat`,
    Post = `Post`,
    Upload = `Upload`,
    Message = `Message`,
    Feature = `Feature`,
    Notification = `Notification`,
}

export enum AuthStates {
    Next = `Next`,
    Sign_In = `Sign In`,
    Sign_Up = `Sign Up`,
    Sign_Out = `Sign Out`,
    Reset_Password = `Reset Password`,
    Forgot_Password = `Forgot Password`,
}