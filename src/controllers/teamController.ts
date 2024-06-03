import { Request, Response } from 'express';
import {
  createNewTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  getTeamByName,
  updateTeam,
} from '../models/teamModel';

async function store(request: Request, response: Response): Promise<void> {
  try {
    const { id, name } = request.body;
    const team = await createNewTeam(id, name);
    response.json(team);
  } catch (error) {
    console.error('Erro ao adicionar time: ', error);
    response.status(400).send(error.message);
  }
}

async function index(request: Request, response: Response): Promise<void> {
  try {
    const teams = await getAllTeams();
    response.json(teams);
  } catch (error) {
    console.error('Erro ao buscar times: ', error);
    response.status(400).send(error.message);
  }
}

async function show(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params;
    const team = await getTeamById(id);
    response.json(team);
  } catch (error) {
    console.error('Erro ao buscar time: ', error);
    response.status(400).send(error.message);
  }
}

async function update(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params;
    const requestData = { ...request.body };
    const updatedTeam = await updateTeam(id, requestData);
    response.json(updatedTeam);
  } catch (error) {
    console.error('Erro ao atualizar time: ', error);
    response.status(400).send(error.message);
  }
}

async function destroy(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params;
    const deletedTeam = await deleteTeam(id);
    response.json(deletedTeam);
  } catch (error) {
    console.error('Erro ao deletar time: ', error);
    response.status(400).send(error.message);
  }
}

async function getByName(request: Request, response: Response): Promise<void> {
  try {
    const { name } = request.params;
    const team = await getTeamByName(name);

    if (!team) {
      response.json({ message: 'Time não encontrado.' });
    } else {
      response.json(team);
    }
  } catch (error) {
    console.error('Erro ao buscar time: ', error);
    response.status(400).send(error.message);
  }
}

export { store, index, show, update, destroy, getByName };