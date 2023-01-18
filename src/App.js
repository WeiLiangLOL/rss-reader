import React, { useState, useEffect } from "react";

import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import 'bootstrap/dist/css/bootstrap.css';

function App() {
  const [rssUrl, setRssUrl] = useState("");
  const [items, setItems] = useState([]);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const interval = setInterval(fetchFeed, 1000);
    return () => clearInterval(interval);
  }, [fetchFeed])

  function fetchFeed() {
    let urls = rssUrl.split(',');
    let invalid = false;
    let queue = [];
    
    if (rssUrl.length == 0) {
      setItems([]);
      setInvalid(false);
      return;
    };

    for (let i = 0; i < urls.length; i++) {
      let link = urls[i].trim();
      let feed = fetch(`https://api.rss2json.com/v1/api.json?rss_url=${link}`)
        .then(res => res.json())
        .then(data => {
          if (!data.items) {
            invalid = true;
            return [];
          }
          let entries = data.items.map(item => ({
            link: item.link,
            title: item.title,
            description: item.description,
            author: item.author
          }));
          return entries;
        });
      queue.push(feed);
    }

    Promise.all(queue).then(data => {
      setItems(data.flat());
      setInvalid(invalid);
    });
  }

  return (
    <Container className="mt-3">
      <h1>RSS Reader</h1>

      {
        invalid ? (
          <Alert variant="danger">
            Invalid URL detected!
          </Alert>
        ) : ''
      }

      <Form>
        <Form.Group className="mb-3" controlId="formRSS">
          <Form.Label>RSS URLs</Form.Label>
          <Form.Control as="textarea" placeholder="Enter RSS URLs..." onChange={(e) => setRssUrl(e.target.value)} value={rssUrl} />
          <Form.Text className="text-muted">
            Tip: You can submit multiple comma seperated URLs!
          </Form.Text>
        </Form.Group>
      </Form>

      <Row>
        {items.map((item, i) => {
          return (
            <Col md={3} key={i}>
              <Card>
                <Card.Body mb={3}>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{item.author}</Card.Subtitle>
                  <Card.Text>{item.description}</Card.Text>
                  <Card.Link href={item.link}>Link</Card.Link>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default App;
