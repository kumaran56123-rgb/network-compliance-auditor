import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'public', 'sample-configs');
mkdirSync(outDir, { recursive: true });

const configs = {
  'core-sw-01.cfg': `!
! Cisco IOS sample config for core-sw-01
! Generated for NetAudit demo
!
hostname core-sw-01
!
version 17.9
service timestamps debug datetime msec
service timestamps log datetime msec
!
enable secret 5 $1$xyz
!
aaa new-model
aaa authentication login default local
!
username admin privilege 15 secret 5 $1$abc
!
ip domain-name example.com
crypto key generate rsa modulus 2048
!
ip ssh version 2
ip ssh time-out 60
ip ssh authentication-retries 3
!
interface GigabitEthernet0/0
 description Uplink to Core
 ip address 10.0.0.1 255.255.255.0
 no shutdown
!
interface GigabitEthernet0/1
 description Access VLAN 10
 switchport mode access
 switchport access vlan 10
!
no logging buffered
logging trap informational
logging console critical
!
ip http server
ip http secure-server
!
banner motd # Unauthorized access prohibited #
!
line console 0
 password cisco
 login
line vty 0 4
 transport input ssh
!
end`,
  'edge-jn-01.conf': `#
# Juniper JUNOS sample config for edge-jn-01
# Generated for NetAudit demo
#
system {
    host-name edge-jn-01;
    domain-name example.com;
    root-authentication {
        encrypted-password "$1$xyz";
    }
    services {
        ssh {
            protocol-version v2;
            connection-limit 10;
        }
        web-management {
            http;
            https {
                system-generated-certificate;
            }
        }
    }
    syslog {
        user * {
            any emergency;
        }
        file messages {
            any notice;
        }
    }
}
interfaces {
    ge-0/0/0 {
        description "Uplink to Core";
        unit 0 {
            family inet {
                address 10.0.1.1/24;
            }
        }
    }
    ge-0/0/1 {
        description "Access VLAN 10";
        unit 0 {
            family ethernet-switching {
                port-mode access;
                vlan {
                    members vlan-10;
                }
            }
        }
    }
}
set system services telnet;
set system services dns;
`,
  'fw-pa-01.txt': `#
# Palo Alto Networks sample config for fw-pa-01
# Generated for NetAudit demo
#
set deviceconfig setting-management web-session idle-timeout 30
set deviceconfig setting-management http-redirect disable
set deviceconfig setting-management ssh-service disable
set deviceconfig setting-management telnet-service disable
set deviceconfig setting-management dns-setting servers 8.8.8.8
set deviceconfig setting-management dns-setting servers 8.8.4.4
set deviceconfig setting-management dns-setting port 53
set deviceconfig setting-management dns-setting type IPv4
set deviceconfig setting-mgmt-config commit-timeout 30
set deviceconfig setting-mgmt-config pending-changes-timeout 30
set deviceconfig setting-mgmt-config ip-address 10.0.2.1
set deviceconfig setting-mgmt-config netmask 255.255.255.0
set deviceconfig setting-mgmt-config default-gateway 10.0.2.254
set deviceconfig setting-mgmt-config dns-primary 8.8.8.8
set deviceconfig setting-mgmt-config dns-secondary 8.8.4.4
set deviceconfig setting-mgmt-config timezone America/Los_Angeles
set deviceconfig setting-mgmt-config ntp-server 0.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 1.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 2.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 3.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 4.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 5.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 6.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 7.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 8.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 9.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 10.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 11.pool.ntp.org
set deviceconfig setting-mgmt-config ntp-server 12.pool.ntp.org
`,
};

for (const [name, content] of Object.entries(configs)) {
  writeFileSync(join(outDir, name), content);
  console.log(`Wrote ${name} (${content.length} bytes)`);
}
console.log(`\nSample configs available at ${outDir}`);
console.log('Serve with: npx serve public/sample-configs');
