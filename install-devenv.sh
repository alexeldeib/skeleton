#!/bin/bash

# Script to install and set up devenv.sh for the SaaS template
set -e

# Colors
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${YELLOW}Installing devenv.sh development environment...${RESET}"

# Check if Nix is already installed
if command -v nix >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Nix is already installed${RESET}"
else
  echo -e "${YELLOW}Installing Nix...${RESET}"
  curl -L https://nixos.org/nix/install | sh
  
  # Source nix
  if [ -e ~/.nix-profile/etc/profile.d/nix.sh ]; then
    . ~/.nix-profile/etc/profile.d/nix.sh
  elif [ -e ~/.nixos-profile/etc/profile.d/nix.sh ]; then
    . ~/.nixos-profile/etc/profile.d/nix.sh
  elif [ -e /nix/var/nix/profiles/default/etc/profile.d/nix.sh ]; then
    . /nix/var/nix/profiles/default/etc/profile.d/nix.sh
  else
    echo -e "${RED}Could not find nix.sh to source. You may need to restart your shell.${RESET}"
    exit 1
  fi
fi

# Check if devenv is already installed
if command -v devenv >/dev/null 2>&1; then
  echo -e "${GREEN}✓ devenv.sh is already installed${RESET}"
else
  echo -e "${YELLOW}Installing devenv.sh...${RESET}"
  curl -L https://get.devenv.sh/install.sh | bash
fi

# Check if direnv is installed
if command -v direnv >/dev/null 2>&1; then
  echo -e "${GREEN}✓ direnv is already installed${RESET}"
else
  echo -e "${YELLOW}direnv is not installed.${RESET}"
  echo "We recommend installing direnv for automatic environment activation:"
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "  ${YELLOW}brew install direnv${RESET}"
  elif [[ -f /etc/debian_version ]]; then
    echo -e "  ${YELLOW}sudo apt install direnv${RESET}"
  elif [[ -f /etc/fedora-release ]]; then
    echo -e "  ${YELLOW}sudo dnf install direnv${RESET}"
  else
    echo -e "  ${YELLOW}Please install direnv for your platform${RESET}"
  fi
  
  echo "Then add the following to your shell configuration (.bashrc, .zshrc, etc.):"
  echo -e "  ${YELLOW}eval \"\$(direnv hook bash)\"  # or zsh, fish, etc.${RESET}"
  
  read -p "Would you like to continue without direnv? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Installation aborted. Please install direnv and try again.${RESET}"
    exit 1
  fi
fi

# Activate the environment
echo -e "${YELLOW}Activating devenv.sh environment...${RESET}"
if command -v direnv >/dev/null 2>&1; then
  direnv allow
  echo -e "${GREEN}✓ Environment activated with direnv${RESET}"
else
  echo -e "${YELLOW}Running initial setup with devenv...${RESET}"
  devenv shell --impure echo "✓ Shell activated successfully"
  echo -e "${GREEN}✓ Environment configured${RESET}"
  echo
  echo -e "${YELLOW}To enter the environment, run:${RESET}"
  echo -e "  ${GREEN}devenv shell${RESET}"
fi

echo
echo -e "${GREEN}Installation complete!${RESET}"
echo
echo -e "You can now run the following commands:"
echo -e "  ${GREEN}devenv shell${RESET} - Enter the development environment"
echo -e "  ${GREEN}setup${RESET} - Set up the project (first time only)"
echo -e "  ${GREEN}devenv up${RESET} - Start all development servers"
echo
echo -e "For more information, see ${GREEN}docs/devenv.md${RESET}"