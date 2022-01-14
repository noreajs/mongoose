import { CallbackError } from "mongoose";

type HookNextFunction = (err?: CallbackError | undefined) => void;

export default HookNextFunction;