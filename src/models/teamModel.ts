import { PrismaClient, Teams } from '@prisma/client';
import { IdOnly } from '../types/teams';

const prisma = new PrismaClient();

async function createNewTeam(id: string, name: string): Promise<Teams> {
  console.log(id)
  console.log(name)
  if (!id || !name) throw new Error('ID e nome são obrigatórios para criar um novo time.');

  const teamExists = await prisma.teams.findFirst({
    where: {
      id
    }
  });

  if (teamExists) throw new Error('Esse time já existe!');

  return await prisma.teams.create({
    data: {
      id,
      name
    }
  });
}

async function getAllTeams(): Promise<Teams[]> {
  return await prisma.teams.findMany();
}

async function getTeamById(id: string): Promise<Teams> {
  if (!id) throw new Error('ID é obrigatório para pesquisar o time.');

  const team: Teams = await prisma.teams.findFirst({
    where: {
      id,
    }
  });

  if (!team) throw new Error('Time não cadastrado!');

  return team;
}

async function updateTeam(id: string, requestData: Partial<{ name: string }>): Promise<Teams> {
  if (!id) throw new Error('ID é obrigatório para atualizar o time.');

  const team: Teams = await prisma.teams.findFirst({
    where: {
      id,
    }
  });

  if (!team) throw new Error('Time não encontrado!');

  const updatedData: Teams = { ...team, ...requestData };

  return await prisma.teams.update({
    where: {
      id,
    },
    data: updatedData
  });
}

async function deleteTeam(id: string): Promise<Teams> {
  if (!id) throw new Error('ID é obrigatório para deletar um time');

  return await prisma.teams.delete({
    where: {
      id
    }
  });
}

async function getTeamByName(name: string): Promise<Teams | null> {
  if (!name) throw new Error('Nome é obrigatório para pesquisar o time.');

  const team: Teams = await prisma.teams.findFirst({
    where: {
      name,
    }
  });

  return team || null;
}

async function getShouldUpdateTeam(): Promise<IdOnly[]> {
  const teamsIds: IdOnly[] = await prisma.teams.findMany({
    select: {
      id: true
    },
    where: {
      shouldUpdate: true
    }
  })
  
  return teamsIds
}

export {
  createNewTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamByName,
  getShouldUpdateTeam
};
