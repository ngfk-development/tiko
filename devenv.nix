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
      after = [
        "tiko:install"
        "devenv:processes:postgres"
      ];
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

    storybook = {
      cwd = "${config.devenv.root}/packages/tiko-storybook";
      exec = "pnpm run dev --ci";
      after = [ "tiko:install" ];
      env.FORCE_COLOR = "1";
      restart.on = "never";
      ready = {
        http.get = {
          host = "localhost";
          port = 6006;
          path = "/";
        };
        initial_delay = 5;
      };
    };
  };

  services.postgres = {
    enable = true;
    package = pkgs.postgresql_18;
    port = 5432;
    listen_addresses = "localhost";
    initialDatabases = [
      {
        name = "tiko";
        user = "postgres";
      }
      {
        name = "tiko_test";
        user = "postgres";
      }
    ];
    initialScript = ''
      ALTER ROLE postgres WITH LOGIN PASSWORD 'postgres' SUPERUSER;
    '';
  };

  scripts = {
    pc.exec = "process-compose \"$@\"";
  };
}
