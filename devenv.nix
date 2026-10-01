{ pkgs, lib, config, ... }:

{
  packages = [
    pkgs.git
    pkgs.nixd
  ];

  env.NODE_ENV = "development";
  env.LOG_LEVEL = lib.mkDefault "debug";

  languages.javascript.enable = true;
  languages.javascript.pnpm.enable = true;

  process.manager.implementation = "process-compose";

  tasks = {
    "tiko:install" = {
      cwd = config.devenv.root;
      exec = "pnpm install";
    };
  };

  processes = {
    client = {
      cwd = "${config.devenv.root}/packages/tiko-client";
      exec = "pnpm run dev";
      after = [ "tiko:install" ];
      env.FORCE_COLOR = "1";
      restart.on = "never";
      ready = {
        http.get = {
          host = "localhost";
          port = 5173;
          path = "/";
        };
        initial_delay = 5;
      };
    };

    server = {
      cwd = "${config.devenv.root}/packages/tiko-server";
      exec = "pnpm run dev";
      after = [ "tiko:install" ];
      env.FORCE_COLOR = "1";
      restart.on = "never";
      ready = {
        http.get = {
          host = "localhost";
          port = 3000;
          path = "/api/health";
        };
        initial_delay = 2;
      };
    };
  };

  scripts = {
    pc.exec = "process-compose \"$@\"";
  };
}
