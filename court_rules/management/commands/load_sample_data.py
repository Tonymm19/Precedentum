from django.core.management.base import BaseCommand
from django.db import transaction
from court_rules.models import District, Judge, RuleCategory, Rule
from datetime import date


class Command(BaseCommand):
    help = 'Load sample data for the court rules application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of existing data',
        )

    def handle(self, *args, **options):
        force = options['force']
        
        with transaction.atomic():
            # Create Northern District of Illinois
            district, created = District.objects.get_or_create(
                name="Northern District of Illinois",
                defaults={'state': 'Illinois'}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created district: {district.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'District already exists: {district.name}')
                )

            # Create 3 sample judges with realistic names
            judges_data = [
                {'first_name': 'Sarah', 'last_name': 'Johnson'},
                {'first_name': 'Michael', 'last_name': 'Rodriguez'},
                {'first_name': 'Jennifer', 'last_name': 'Chen'},
            ]
            
            created_judges = []
            for judge_data in judges_data:
                judge, created = Judge.objects.get_or_create(
                    first_name=judge_data['first_name'],
                    last_name=judge_data['last_name'],
                    district=district,
                    defaults=judge_data
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Created judge: {judge.first_name} {judge.last_name}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'Judge already exists: {judge.first_name} {judge.last_name}')
                    )
                created_judges.append(judge)

            # Create rule categories
            categories_data = [
                {'name': 'FEDERAL', 'description': 'Federal rules of civil procedure'},
                {'name': 'LOCAL', 'description': 'Local rules for the Northern District of Illinois'},
                {'name': 'JUDGE_SPECIFIC', 'description': 'Rules specific to individual judges'},
            ]
            
            created_categories = {}
            for category_data in categories_data:
                category, created = RuleCategory.objects.get_or_create(
                    name=category_data['name'],
                    defaults=category_data
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Created category: {category.get_name_display()}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'Category already exists: {category.get_name_display()}')
                    )
                created_categories[category.name] = category

            # Create 5 sample rules for the Northern District
            rules_data = [
                {
                    'title': 'Electronic Filing Requirements',
                    'content': 'All documents must be filed electronically through the CM/ECF system unless specifically exempted by court order. Paper filings are only accepted in emergency situations.',
                    'category': created_categories['LOCAL'],
                    'rule_number': 'LR 5.2',
                    'effective_date': date(2023, 1, 1),
                },
                {
                    'title': 'Motion Practice Standards',
                    'content': 'All motions must include a statement of facts, legal argument, and proposed order. Responses are due within 14 days unless otherwise specified by the court.',
                    'category': created_categories['LOCAL'],
                    'rule_number': 'LR 7.1',
                    'effective_date': date(2023, 1, 1),
                },
                {
                    'title': 'Discovery Disputes',
                    'content': 'Parties must meet and confer in good faith before filing any discovery motion. A certification of consultation must be filed with the motion.',
                    'category': created_categories['FEDERAL'],
                    'rule_number': 'FRCP 37',
                    'effective_date': date(2022, 12, 1),
                },
                {
                    'title': 'Judge Johnson\'s Standing Order on Case Management',
                    'content': 'All cases assigned to Judge Johnson will follow a streamlined discovery schedule. Initial disclosures must be made within 30 days of the Rule 26(f) conference.',
                    'category': created_categories['JUDGE_SPECIFIC'],
                    'rule_number': 'SO-2023-001',
                    'effective_date': date(2023, 3, 1),
                    'judge': created_judges[0],  # Judge Johnson
                },
                {
                    'title': 'Settlement Conference Procedures',
                    'content': 'Settlement conferences will be conducted by the assigned magistrate judge unless otherwise ordered. Parties must submit confidential settlement statements 48 hours before the conference.',
                    'category': created_categories['LOCAL'],
                    'rule_number': 'LR 16.3',
                    'effective_date': date(2023, 2, 1),
                },
            ]
            
            for rule_data in rules_data:
                rule, created = Rule.objects.get_or_create(
                    title=rule_data['title'],
                    district=district,
                    defaults=rule_data
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Created rule: {rule.title}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'Rule already exists: {rule.title}')
                    )

        self.stdout.write(
            self.style.SUCCESS('Successfully loaded sample data!')
        )

