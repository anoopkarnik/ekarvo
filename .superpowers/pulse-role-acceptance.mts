import 'dotenv/config';
import db from '../packages/database/src/client';
import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';
import { verifyPassword } from '../packages/database/node_modules/better-auth/dist/crypto/index.mjs';
const digest = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex');
try {
 const orgs = await db.organization.findMany({where:{bpo:{is:{seeded:true}}}});
 if(orgs.length!==1 || !orgs[0]!.slug.startsWith('pulse-demo-')) throw Error('Ambiguous demo ownership');
 const org=orgs[0]!, ownerId=org.slug.slice('pulse-demo-'.length), where={organizationId:org.id};
 const owner=await db.user.findUniqueOrThrow({where:{id:ownerId},select:{id:true,email:true,role:true,password:true,accounts:{select:{id:true,providerId:true,accountId:true,password:true},orderBy:{id:'asc'}},members:{where:{organizationId:{not:org.id}},orderBy:{id:'asc'}}}});
 const master=await Promise.all([db.clientAccount.findMany({where,orderBy:{id:'asc'}}),db.pulseTeam.findMany({where,orderBy:{id:'asc'}}),db.pulseWorker.findMany({where,orderBy:{id:'asc'}}),db.pulseProcess.findMany({where,orderBy:{id:'asc'}}),db.pulseWorkType.findMany({where,orderBy:{id:'asc'}}),db.pulseSite.findMany({where,orderBy:{id:'asc'}})]);
 const raw=await db.pulseRecord.findMany({where,orderBy:{id:'asc'}});
 const snapshot={organizationId:org.id,ownerId,ownerDigest:digest(owner),masterDigest:digest(master),rawDigest:digest(raw),rawCount:raw.length};
 if(process.argv[2]==='before') { writeFileSync('/tmp/pulse-role-before.json',JSON.stringify(snapshot)); console.log(JSON.stringify({snapshotSaved:true,clients:master[0]!.length,teams:master[1]!.length,workers:master[2]!.length,rawRecords:raw.length})); }
 else {
 const previous=JSON.parse(readFileSync('/tmp/pulse-role-before.json','utf8'));
 for(const key of ['organizationId','ownerId','ownerDigest','masterDigest','rawDigest','rawCount']) if(snapshot[key as keyof typeof snapshot]!==previous[key]) throw Error(`Preservation failed: ${key}`);
 const members=await db.member.findMany({where,include:{user:{include:{accounts:{where:{providerId:'credential'}}}},bpoAdmin:true,pulseGrants:{include:{teams:true}}}});
 if(members.length!==16 || members.some(m=>m.userId===ownerId)) throw Error('Wrong demo member topology');
 for(const m of members) {
  if(m.user.role!=='user'||!m.user.emailVerified||m.user.accounts.length!==1) throw Error('Wrong login provisioning');
  if(!await verifyPassword({hash:m.user.accounts[0]!.password!,password:'password'})) throw Error(`Password verification failed: ${m.user.email}`);
  if(m.bpoAdmin && m.pulseGrants.length) throw Error('IT has operational grants');
 }
 if(members.filter(m=>m.bpoAdmin).length!==1) throw Error('Wrong IT count');
 if(members.filter(m=>m.pulseGrants[0]?.role==='COO_EXECUTIVE'&&m.pulseGrants.length===6).length!==1) throw Error('Wrong COO grants');
 if(members.filter(m=>m.pulseGrants[0]?.role==='OPS_MANAGER'&&m.pulseGrants.length===3).length!==2) throw Error('Wrong Manager grants');
 const leads=members.filter(m=>m.pulseGrants[0]?.role==='TEAM_LEAD');
 if(leads.length!==12||leads.some(m=>m.pulseGrants.length!==1||m.pulseGrants[0]!.teams.length!==1)||new Set(leads.flatMap(m=>m.pulseGrants.flatMap(g=>g.teams.map(t=>t.teamId)))).size!==12) throw Error('Wrong TL scopes');
 console.log(JSON.stringify({preservedAdminCredentials:true,preservedOtherMemberships:true,preservedMasterData:true,preservedRawRecords:true,demoBpos:orgs.length,demoStaff:members.length,credentialPasswordsVerified:16,rawRecords:raw.length}));
 }
} finally { await db.$disconnect(); }
