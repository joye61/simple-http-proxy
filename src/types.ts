import Application from "koa";

export type KoaContext = Application.ParameterizedContext<
  Application.DefaultState,
  Application.DefaultContext
>;
