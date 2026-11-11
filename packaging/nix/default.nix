# Template: runs the web files with nixpkgs' Electron. Not tested.
#   nix-build packaging/nix/default.nix && ./result/bin/monowordtest
{ pkgs ? import <nixpkgs> { } }:
pkgs.stdenv.mkDerivation {
  pname = "monowordtest";
  version = "0.0.1";
  src = ../..;
  nativeBuildInputs = [ pkgs.makeWrapper ];
  dontBuild = true;
  installPhase = ''
    mkdir -p $out/share/monowordtest/desktop $out/share/monowordtest/build $out/share/monowordtest/sounds $out/bin
    cp index.html ads.js about.js sounds.js dictionary.js package.json $out/share/monowordtest/
    cp sounds/*.mp3 $out/share/monowordtest/sounds/
    cp desktop/main.js desktop/mo.js desktop/preload.js $out/share/monowordtest/desktop/
    cp build/icon.png $out/share/monowordtest/build/
    makeWrapper ${pkgs.electron}/bin/electron $out/bin/monowordtest \
      --add-flags "$out/share/monowordtest"
  '';
  meta = { description = "Translation guessing game"; mainProgram = "monowordtest"; };
}
