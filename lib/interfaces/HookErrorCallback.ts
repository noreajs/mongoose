import { CallbackError } from "mongoose";

type HookErrorCallback = (error: CallbackError) => void;

export default HookErrorCallback;
