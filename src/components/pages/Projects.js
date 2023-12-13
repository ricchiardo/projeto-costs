import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Message from "../layout/Message"
import Container from "../layout/Container"
import ProjectCard from '../project/ProjectCard'

import styles from './Projects.module.css'



function Projects() {
  const [projects, setProjects] = useState([])
  const [sortOption, setSortOption] = useState("shuffle");

  const location = useLocation()

  let message = ''
  if (location.state) {
    message = location.state.message
    console.log(message)
  }

  function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
      let current = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j] > current) {
        arr[j + 1] = arr[j];
        j--;
      }

      arr[j + 1] = current;
    }

    return arr;
  }

  function quickSort(arr) {
    if (arr.length <= 1) {
      return arr;
    }

    const pivot = arr[0];
    const left = [];
    const right = [];

    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < pivot) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }

    return [...quickSort(left), pivot, ...quickSort(right)];
  }

  function mergeSort(arr) {
    if (arr.length <= 1) {
      return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    return merge(mergeSort(left), mergeSort(right));
  }

  function merge(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex].id < right[rightIndex].id) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return result.concat(left.slice(leftIndex), right.slice(rightIndex));
  }

  class Node {
    constructor(project) {
      this.project = project;
      this.height = 1;
      this.left = null;
      this.right = null;
    }
  }

  function height(node) {
    return node ? node.height : 0;
  }

  function updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(height(node.left), height(node.right));
    }
  }

  function balanceFactor(node) {
    return node ? height(node.left) - height(node.right) : 0;
  }

  function rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    updateHeight(y);
    updateHeight(x);

    return x;
  }

  function rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    updateHeight(x);
    updateHeight(y);

    return y;
  }

  function insertNode(root, project) {
    if (!root) {
      return new Node(project);
    }

    if (project.id < root.project.id) {
      root.left = insertNode(root.left, project);
    } else {
      root.right = insertNode(root.right, project);
    }

    updateHeight(root);

    const balance = balanceFactor(root);

    if (balance > 1) {
      if (project.id < root.left.project.id) {
        return rotateRight(root);
      } else {
        root.left = rotateLeft(root.left);
        return rotateRight(root);
      }
    }

    if (balance < -1) {
      if (project.id > root.right.project.id) {
        return rotateLeft(root);
      } else {
        root.right = rotateRight(root.right);
        return rotateLeft(root);
      }
    }

    return root;
  }

  function inorderTraversal(node, result) {
    if (node) {
      inorderTraversal(node.left, result);
      result.push(node.project);
      inorderTraversal(node.right, result);
    }
  }

  function avlSort(projects) {
    let root = null;

    for (const project of projects) {
      root = insertNode(root, project);
    }

    const result = [];
    inorderTraversal(root, result);

    return result;
  }

  useEffect(() => {
    fetch("http://localhost:1818/projects", {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    }).then(resp => resp.json())
      .then(data => {
        let sortedProjects = [...data];

        if (sortOption === "shuffle") {
          sortedProjects = sortedProjects.sort(() => Math.random() - 0.5);
        } else if (sortOption === "Insertion Sort") {
          sortedProjects = insertionSort(sortedProjects);
        } else if (sortOption === "Quick Sort") {
          sortedProjects = quickSort(sortedProjects);
        } else if (sortOption === "Merge Sort") {
          sortedProjects = mergeSort(sortedProjects);
        } else if (sortOption === "AVL Sort") {
          sortedProjects = avlSort(sortedProjects);
        }

        setProjects(sortedProjects);
      })
      .catch((err) => console.log(err))
  }, [sortOption])


  return (
    <div className={styles.project_container}>
      <div className={styles.title_container}>
        <h1>Meus Projetos</h1>
        {/* <LinkButton to="/newproject" text='Criar Projeto' /> */}
        <select onChange={(e) => setSortOption(e.target.value)}>
          <option value="shuffle">Aleatório</option>
          <option value="Insertion Sort">Insertion Sort</option>
          <option value="Quick Sort">Quick Sort</option>
          <option value="Merge Sort">Merge Sort</option>
          <option value="AVL Sort">Árvore AVL</option>
        </select>
      </div>
      {message && <Message msg={message} type="success" />}
      <Container custonClass="start">
        {projects.length > 0 &&
          projects.map((project) =>
            <ProjectCard
              id={project.id}
              name={project.name}
              budget={project.budget}
              category={project?.category?.name}
              key={project.id}
            />)}
      </Container>
    </div>
  )

}

export default Projects