import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    errorInputMsg: '',
    repositories: [],
    loading: false,
    warn: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    try {
      const response = await api.get(`/repos/${newRepo}`);
      if (newRepo === '') {
        throw new Error('Invalid repository');
      }

      const hasRepo = repositories.find(
        repo => repo.name === response.data.full_name
      );

      if (hasRepo) {
        throw new Error('duplicated');
      }

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        warn: false,
        errorInputMsg: '',
      });
    } catch (error) {
      this.setState({
        newRepo: '',
        loading: false,
        warn: true,
        errorInputMsg: error.response
          ? error.response.data.message
          : error.message,
      });
    }
  };

  render() {
    const { newRepo, loading, repositories, warn, errorInputMsg } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt /> Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} erro={warn}>
          <div>
            <input
              type="text"
              placeholder="Adicionar repositório"
              value={newRepo}
              onChange={this.handleInputChange}
            />
            <SubmitButton loading={loading}>
              {loading ? (
                <FaSpinner color="#FFF" size={14} />
              ) : (
                <FaPlus color="#fff" size={14} />
              )}
            </SubmitButton>
          </div>
          {warn && <p>REPOSITORY {errorInputMsg.toUpperCase()}</p>}
        </Form>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
