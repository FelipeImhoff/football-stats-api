import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createNewTeam(id, name) {
  if (!id || !name) throw new Error('ID e nome são obrigatórios para criar um novo time.')

  const teamExists = await prisma.teams.findFirst({
    where: {
      id,
      name
    }
  })

  if (teamExists) throw new Error('Esse time já existe!')

  return await prisma.teams.create({
    data: {
      id,
      name
    }
  })
}

async function getAllTeams() {
  return await prisma.teams.findMany()
}

async function getTeamById(id) {
  if (!id) throw new Error('ID é obrigatório para pesquisar o time.')

  const team = await prisma.teams.findFirst({
    where: {
      id,
    }
  })

  if (!team) throw new Error('Time não cadastrado!')

  return team
}

async function updateTeam(id, requestData) {
  if (!id) throw new Error('ID é obrigatório para atualizar o time.')

  const team = await prisma.teams.findFirst({
    where: {
      id,
    }
  })

  if (!team) throw new Error('Time não encontrado!')

  const updatedData = { ...team, ...requestData }

  return await prisma.teams.update({
    where: {
      id,
    },
    data: updatedData
  })
}

async function deleteTeam(id) {
  if (!id) throw new Error('ID é obrigatório para deletar um time')

  return await prisma.teams.delete({
    where: {
      id
    }
  })
}

async function getTeamByName(name) {
  if (!name) throw new Error('Nome é obrigatório para pesquisar o time.')

  const team = await prisma.teams.findFirst({
    where: {
      name,
    }
  })

  return team || null
}

export {
  createNewTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamByName
}
