# Template: runs the web files with nixpkgs' Electron. Not tested.
#   nix-build packaging/nix/default.nix && ./result/bin/monowordtest
{ pkgs ? import <nixpkgs> { } }:
pkgs.stdenv.mkDerivation {
  pname = "monowordtest";
  version = "1.0.0";
  src = ../..;
  nativeBuildInputs = [ pkgs.makeWrapper ];
  dontBuild = true;
  installPhase = ''
    mkdir -p $out/share/monowordtest/desktop $out/share/monowordtest/build $out/bin
    cp index.html translations.js ads.js dictionary.js package.json $out/share/monowordtest/
    cp desktop/main.js $out/share/monowordtest/desktop/
    cp build/icon.png $out/share/monowordtest/build/
    makeWrapper ${pkgs.electron}/bin/electron $out/bin/monowordtest \
      --add-flags "$out/share/monowordtest"
  '';
  meta = { description = "Translation guessing game"; mainProgram = "monowordtest"; };
}
