{
  description = "A Nix-flake-based Node.js development environment";

  inputs = {
    nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1"; # unstable Nixpkgs

    # Keep Node.js on a channel where the security-fixed build is cached.
    nodejs-nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
  };

  outputs =
    { self, ... }@inputs:

    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            inherit system;
            pkgs = import inputs.nixpkgs {
              inherit system;
            };
            nodePkgs = import inputs.nodejs-nixpkgs { inherit system; };
          }
        );
    in
    {
      devShells = forEachSupportedSystem (
        {
          pkgs,
          nodePkgs,
          system,
        }:
        let
          nodejs = nodePkgs.nodejs_24;
          pnpm = pkgs.pnpm.override { nodejs-slim = nodePkgs.nodejs-slim_24; };
        in
        {
          default = pkgs.mkShellNoCC {
            packages = [
              nodejs
              pnpm
              self.formatter.${system}
            ];
          };
        }
      );

      formatter = forEachSupportedSystem ({ pkgs, ... }: pkgs.nixfmt);
    };
}
