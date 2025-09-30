from django.db import models

class District(models.Model):
    name = models.CharField(max_length=200, unique=True)
    state = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Judge(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='judges')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['last_name', 'first_name']
        unique_together = ['first_name', 'last_name', 'district']


class RuleCategory(models.Model):
    CATEGORY_TYPES = [
        ('FEDERAL', 'Federal'),
        ('LOCAL', 'Local'),
        ('JUDGE_SPECIFIC', 'Judge-Specific'),
    ]
    
    name = models.CharField(max_length=50, choices=CATEGORY_TYPES, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.get_name_display()

    class Meta:
        ordering = ['name']


class Rule(models.Model):
    title = models.CharField(max_length=300)
    content = models.TextField()
    category = models.ForeignKey(RuleCategory, on_delete=models.CASCADE, related_name='rules')
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='rules')
    judge = models.ForeignKey(Judge, on_delete=models.CASCADE, related_name='rules', null=True, blank=True)
    rule_number = models.CharField(max_length=50, blank=True)
    effective_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.rule_number}: {self.title}" if self.rule_number else self.title

    class Meta:
        ordering = ['rule_number', 'title']
