import fetch from 'node-fetch'
import { $ } from 'zx'

export async function allowLocalIpAccess({ hostname, port }: { hostname: string; port: number }) {
  const region = hostname.split('.')[2]
  const securityGroupId = getFirstSecurityGroup(hostname, await listRdsInstances(region))
  const localIp = await getCurrentIp()

  const output = JSON.parse(
    (
      await $`aws ec2 authorize-security-group-ingress --group-id ${securityGroupId} --ip-permissions IpProtocol=tcp,FromPort=${port},ToPort=${port},IpRanges='[{CidrIp=${localIp}/32,Description="Local IP access for dbsync"}]' --region ${region}`
    ).stdout
  )

  return {
    region,
    securityGroupId: output.SecurityGroupRules[0].GroupId,
    ruleId: output.SecurityGroupRules[0].SecurityGroupRuleId
  }
}

export async function denyLocalIpAccess({
  region,
  securityGroupId,
  ruleId
}: {
  region: string
  securityGroupId: string
  ruleId: string
}) {
  await $`aws ec2 revoke-security-group-ingress --group-id ${securityGroupId} --security-group-rule-ids ${ruleId} --region ${region}`
}

async function listRdsInstances(region: string) {
  return JSON.parse((await $`aws rds describe-db-instances --region ${region}`).stdout).DBInstances
}

async function getCurrentIp() {
  return await fetch('http://whatismyip.akamai.com').then((response) => response.text())
}

function getFirstSecurityGroup(hostname: string, instances: any[]) {
  const instance = instances.find((instance) => instance.Endpoint.Address === hostname)
  return instance.VpcSecurityGroups[0].VpcSecurityGroupId
}
