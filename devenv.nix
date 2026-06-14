{ pkgs, config, ... }:

{
  packages = [
    pkgs.git
    pkgs.cargo-watch
    pkgs.traefik
    pkgs.nixd
  ];

  languages.javascript.enable = true;
  languages.javascript.pnpm.enable = true;
  languages.rust.enable = true;

  process.manager.implementation = "process-compose";

  processes = {
    backend = {
      cwd = "${config.devenv.root}/backend";
      after = [
        "devenv:processes:postgres"
        "devenv:processes:traefik"
        "devenv:processes:graphql:gen:schema@started"
      ];
      exec = ''
        cargo run migrate
        cargo run seed

        cargo watch \
          -w crates \
          -w Cargo.toml \
          -w Cargo.lock \
          -x 'run -- serve --log-level trace'
      '';
      restart.on = "never";
      ready = {
        http.get = {
          port = 4000;
          path = "/live";
        };
        initial_delay = 5;
      };
    };

    frontend = {
      cwd = "${config.devenv.root}/frontend";
      env.FORCE_COLOR = "1";
      after = [
        "devenv:processes:backend"
        "devenv:processes:graphql:gen:ts@started"
      ];
      exec = ''
        pnpm i
        pnpm run dev
      '';
      restart.on = "never";
      ready = {
        http.get = {
          port = 5173;
          path = "/";
        };
        initial_delay = 5;
      };
    };

    "graphql:gen:schema" = {
      cwd = "${config.devenv.root}/backend";
      exec = "cargo run schema --out ../frontend/generated/schema.gql";
      restart.on = "never";
      watch = {
        paths = [ ./backend/crates/tiko-api/src/graphql ];
        extensions = [ "rs" ];
      };
    };

    "graphql:gen:ts" = {
      cwd = "${config.devenv.root}/frontend/app";
      exec = "gql-tada generate-output -c tsconfig.app.json";
      restart.on = "never";
      watch = {
        paths = [ ./frontend/app/generated ];
        extensions = [ "gql" ];
      };
    };

    traefik = {
      cwd = "${config.devenv.root}/traefik";
      exec = "traefik --configFile=traefik.yml";
      ready = {
        http.get = {
          port = 3000;
          path = "/live";
        };
        initial_delay = 1;
        probe_timeout = 3;
      };
    };
  };

  services.postgres = {
    enable = true;
    package = pkgs.postgresql_18;
    port = 5432;
    listen_addresses = "localhost";
    initialDatabases = [
      { name = "postgres"; user = "postgres"; }
      { name = "tiko"; user = "postgres"; }
    ];
    initialScript = ''
      ALTER ROLE postgres WITH LOGIN PASSWORD 'postgres' SUPERUSER;
    '';
  };

  scripts = {
    pc.exec = "process-compose \"$@\"";
  };
}
