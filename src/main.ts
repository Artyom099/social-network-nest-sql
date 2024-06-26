import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { appSettings } from "./infrastructure/settings/app.settings";

export const bootstrap = async () => {
  try {
    const app = await NestFactory.create(AppModule);
    appSettings<AppModule>(app, AppModule);
    const PORT = process.env.PORT || 3000;

    await app.listen(PORT, () => {
      console.log(`App started at http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log({ cannot_start_app: e });
  }
};
bootstrap();
