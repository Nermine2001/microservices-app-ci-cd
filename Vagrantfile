# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Box Ubuntu 22.04 LTS
  config.vm.box = "ubuntu/jammy64"
  
  # Configuration de la VM
  config.vm.provider "virtualbox" do |vb|
    vb.name = "microservices-cicd-vm"
    vb.memory = "4096"  # 4 GB RAM
    vb.cpus = 2
  end
  
  # Configuration réseau
  config.vm.network "private_network", ip: "192.168.56.10"
  
  # Ports forwarding
  config.vm.network "forwarded_port", guest: 8080, host: 8080  # Jenkins
  config.vm.network "forwarded_port", guest: 3000, host: 3000  # Frontend
  config.vm.network "forwarded_port", guest: 5000, host: 5000  # Backend API
  config.vm.network "forwarded_port", guest: 8000, host: 8000  # Service IA
  config.vm.network "forwarded_port", guest: 9000, host: 9000  # SonarQube (optionnel)
  
  # Dossier partagé
  #config.vm.synced_folder ".", "/home/vagrant/project"
  
  # Provisioning - Installation automatique
  config.vm.provision "shell", inline: <<-SHELL
    echo "=== Mise à jour du système ==="
    apt-get update
    apt-get upgrade -y
    
    echo "=== Installation des dépendances ==="
    apt-get install -y \
      apt-transport-https \
      ca-certificates \
      curl \
      gnupg \
      lsb-release \
      software-properties-common \
      git \
      vim \
      wget \
      unzip
    
    echo "=== Installation Docker ==="
    # Ajout du dépôt Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Ajouter l'utilisateur vagrant au groupe docker
    usermod -aG docker vagrant
    
    echo "=== Installation Docker Compose ==="
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    echo "=== Installation Jenkins ==="
    # Ajout de la clé et du dépôt Jenkins
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee \
      /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
      https://pkg.jenkins.io/debian-stable binary/ | tee \
      /etc/apt/sources.list.d/jenkins.list > /dev/null
    
    apt-get update
    
    # Installation Java (requis pour Jenkins)
    apt-get install -y fontconfig openjdk-17-jre
    
    # Installation Jenkins
    apt-get install -y jenkins
    
    # Démarrer Jenkins
    systemctl enable jenkins
    systemctl start jenkins
    
    echo "=== Installation Node.js et npm ==="
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    echo "=== Installation Python et pip ==="
    apt-get install -y python3 python3-pip python3-venv
    
    echo "=== Configuration des permissions ==="
    # Ajouter jenkins au groupe docker
    usermod -aG docker jenkins
    systemctl restart jenkins
    
    echo "=== Nettoyage ==="
    apt-get clean
    
    echo "==================================="
    echo "✅ Installation terminée !"
    echo "==================================="
    echo "Accès Jenkins: http://192.168.56.10:8080"
    echo "Password initial Jenkins:"
    sleep 10
    cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || echo "Jenkins est en cours de démarrage..."
    echo "==================================="
    echo "Utilisez 'vagrant ssh' pour vous connecter"
  SHELL
end
