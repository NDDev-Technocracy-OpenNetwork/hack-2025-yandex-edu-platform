import os
import tempfile
import unittest

os.environ.setdefault('DATABASE_URL', 'postgresql+asyncpg://fixture:fixture@127.0.0.1:65434/fixture')
os.environ.setdefault('OPENAI_API_KEY', 'publication-fixture-not-a-provider-key')
os.environ.setdefault('SECRET_KEY', 'publication-fixture-signing-key')
storage = tempfile.TemporaryDirectory(prefix='grafium-test-')
os.environ['UPLOAD_DIR'] = storage.name

from main import app
from app.api.endpoints import courses


class PublicationSmoke(unittest.TestCase):
    def test_mounted_api_schema(self):
        self.assertGreater(len(app.openapi()['paths']), 10)

    def test_historical_authenticated_router_imports(self):
        self.assertIn('/{course_id}', {route.path for route in courses.router.routes})
