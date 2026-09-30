{ pkgs, ... }:

{
  packages = [
    pkgs.git
    pkgs.nixd
  ];

  process.manager.implementation = "process-compose";

  processes = {};

  scripts = {
    pc.exec = "process-compose \"$@\"";
  };
}
